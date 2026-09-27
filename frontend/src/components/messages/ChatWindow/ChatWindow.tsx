import {
  ArrowLeft,
  Loader2,
  Send,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../../../context/authContext/authContext";

import {
  getMessages,
  markConversationAsRead,
  sendMessage,
  type ConversationUser,
  type Message,
} from "../../../services/api/messageApi";

import "./ChatWindow.css";

interface ChatWindowProps {
  conversationId: string;
  otherUser: ConversationUser;
  onBack?: () => void;
  onMessageSent?: () => void;
}

const MESSAGE_PAGE_SIZE = 50;

export default function ChatWindow({
  conversationId,
  otherUser,
  onBack,
  onMessageSent,
}: ChatWindowProps) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const messagesContainerRef =
    useRef<HTMLDivElement | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const shouldScrollToBottomRef = useRef(true);

  /**
   * Merge incoming messages with the messages
   * already displayed.
   */
  const mergeMessages = useCallback(
    (
      current: Message[],
      incoming: Message[],
    ): Message[] => {
      const messageMap = new Map<string, Message>();

      current.forEach((message) => {
        messageMap.set(message.id, message);
      });

      incoming.forEach((message) => {
        messageMap.set(message.id, message);
      });

      return Array.from(messageMap.values()).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime(),
      );
    },
    [],
  );

  /**
   * Load the newest messages.
   */
  const loadMessages = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const data = await getMessages(
          conversationId,
          1,
          MESSAGE_PAGE_SIZE,
        );

        setMessages((current) =>
          mergeMessages(current, data.messages),
        );

        setCurrentPage(1);
        setHasMore(data.hasMore);

        await markConversationAsRead(
          conversationId,
        );
      } catch (error) {
        console.error(error);

        if (showLoading) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load messages",
          );
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [conversationId, mergeMessages],
  );

  /**
   * Load an older page of messages.
   */
  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMore) {
      return;
    }

    const container =
      messagesContainerRef.current;

    if (!container) {
      return;
    }

    const previousScrollHeight =
      container.scrollHeight;

    const previousScrollTop =
      container.scrollTop;

    try {
      setLoadingOlder(true);
      setError("");

      const nextPage = currentPage + 1;

      const data = await getMessages(
        conversationId,
        nextPage,
        MESSAGE_PAGE_SIZE,
      );

      setMessages((current) =>
        mergeMessages(current, data.messages),
      );

      setCurrentPage(nextPage);
      setHasMore(data.hasMore);

      /**
       * Keep the user's viewport in the same place
       * after older messages are prepended.
       */
      requestAnimationFrame(() => {
        const updatedContainer =
          messagesContainerRef.current;

        if (!updatedContainer) {
          return;
        }

        const newScrollHeight =
          updatedContainer.scrollHeight;

        updatedContainer.scrollTop =
          previousScrollTop +
          (newScrollHeight - previousScrollHeight);
      });
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load older messages",
      );
    } finally {
      setLoadingOlder(false);
    }
  };

  /**
   * Poll for new messages.
   */
  useEffect(() => {
    loadMessages(true);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadMessages(false);
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadMessages(false);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [loadMessages]);

  /**
   * Handle scrolling.
   *
   * When the user reaches the top, fetch older
   * messages.
   */
  const handleMessagesScroll = () => {
    const container =
      messagesContainerRef.current;

    if (!container || loadingOlder || !hasMore) {
      return;
    }

    if (container.scrollTop <= 80) {
      loadOlderMessages();
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    shouldScrollToBottomRef.current =
      distanceFromBottom < 120;
  };

  /**
   * Scroll to the bottom after the first message load.
   */
  useEffect(() => {
    if (!loading && messages.length > 0) {
      if (shouldScrollToBottomRef.current) {
        messagesEndRef.current?.scrollIntoView({
          behavior: "auto",
        });
      }
    }
  }, [loading]);

  /**
   * Automatically follow new messages when the
   * user is already near the bottom.
   */
  useEffect(() => {
    if (!messages.length) {
      return;
    }

    if (!shouldScrollToBottomRef.current) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /**
   * Enter sends.
   * Shift + Enter creates a new line.
   */
  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    if (event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (!content.trim() || sending) {
      return;
    }

    event.currentTarget.form?.requestSubmit();
  };

  /**
   * Send a new message.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const message = await sendMessage(
        conversationId,
        trimmedContent,
      );

      setMessages((current) =>
        mergeMessages(current, [message]),
      );

      setContent("");

      shouldScrollToBottomRef.current = true;

      onMessageSent?.();

      await markConversationAsRead(
        conversationId,
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to send message",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="chat-window">
      {/* Header */}
      <header className="chat-window__header">
        {onBack && (
          <button
            type="button"
            className="chat-window__back"
            onClick={onBack}
            aria-label="Back to conversations"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="chat-window__avatar">
          {otherUser.avatar ? (
            <img
              src={otherUser.avatar}
              alt=""
            />
          ) : (
            otherUser.displayName
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div className="chat-window__user">
          <h2>{otherUser.displayName}</h2>
          <span>@{otherUser.username}</span>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="chat-window__messages"
        onScroll={handleMessagesScroll}
      >
        {loadingOlder && (
          <div className="chat-window__loading-older">
            <Loader2
              size={16}
              className="chat-window__spinner"
            />
            <span>Loading older messages...</span>
          </div>
        )}

        {loading && (
          <div
            className="chat-window__status"
            role="status"
          >
            Loading messages...
          </div>
        )}

        {!loading && error && messages.length === 0 && (
          <div
            className="chat-window__status chat-window__status--error"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          messages.length === 0 && (
            <div className="chat-window__empty">
              <div className="chat-window__empty-icon">
                <Send size={22} />
              </div>

              <h3>Start the conversation</h3>

              <p>
                Send a message to{" "}
                {otherUser.displayName}.
              </p>
            </div>
          )}

        {!loading && messages.length > 0 && (
          <>
            {messages.map((message) => {
              const isMine =
                message.senderId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`chat-message ${
                    isMine
                      ? "chat-message--mine"
                      : "chat-message--other"
                  }`}
                >
                  <div className="chat-message__bubble">
                    <p>{message.content}</p>

                    <time
                      dateTime={message.createdAt}
                    >
                      {new Date(
                        message.createdAt,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </>
        )}

        {!loading &&
          error &&
          messages.length > 0 && (
            <div
              className="chat-window__inline-error"
              role="alert"
            >
              {error}
            </div>
          )}
      </div>

      {/* Composer */}
      <form
        className="chat-window__form"
        onSubmit={handleSubmit}
      >
        <div className="chat-window__composer">
          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherUser.displayName}...`}
            maxLength={2000}
            disabled={sending}
            rows={1}
            aria-label="Message"
          />

          <span className="chat-window__counter">
            {content.length}/2000
          </span>
        </div>

        <button
          type="submit"
          disabled={!content.trim() || sending}
          aria-label="Send message"
        >
          {sending ? (
            <Loader2
              size={18}
              className="chat-window__spinner"
            />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </section>
  );
}

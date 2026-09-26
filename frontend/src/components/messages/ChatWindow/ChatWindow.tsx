import {
  ArrowLeft,
  Send,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async (
  showLoading = false,
) => {
  try {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    const data = await getMessages(conversationId);

    setMessages((current) => {
  if (current.length !== data.length) {
    return data;
  }
  onMessageSent?.();

  const hasChanged = data.some(
    (message, index) =>
      message.id !== current[index]?.id ||
      message.content !== current[index]?.content ||
      message.read !== current[index]?.read,
  );

  return hasChanged ? data : current;

    });

    await markConversationAsRead(conversationId);
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
};
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

  return () => {
    window.clearInterval(interval);
  };
}, [conversationId]);



const messagesContainerRef =
  useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  const container = messagesContainerRef.current;

  if (!container) {
    return;
  }

  const distanceFromBottom =
    container.scrollHeight -
    container.scrollTop -
    container.clientHeight;

  const isNearBottom = distanceFromBottom < 120;

  if (isNearBottom) {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }
}, [messages]);

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

      setMessages((current) => [...current, message]);
      setContent("");
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

        <div  ref={messagesContainerRef} className="chat-window__avatar">
          {otherUser.avatar ? (
            <img
              src={otherUser.avatar}
              alt={otherUser.displayName}
            />
          ) : (
            otherUser.displayName
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div>
          <h2>{otherUser.displayName}</h2>
          <span>@{otherUser.username}</span>
        </div>
      </header>

      <div className="chat-window__messages">
        {loading && (
          <div className="chat-window__status">
            Loading messages...
          </div>
        )}

        {!loading && error && (
          <div className="chat-window__status chat-window__status--error">
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
                Send a message to {otherUser.displayName}.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          messages.length > 0 && (
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

                      <time>
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
      </div>

      {error && messages.length > 0 && (
        <div className="chat-window__send-error">
          {error}
        </div>
      )}

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
          />
          <span className="chat-wiindow__counter">
          {content.length}/2000
          </span>
        </div>
        <button
          type="submit"
          disabled={!content.trim() || sending}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}

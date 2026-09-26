import { MessageCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import ChatWindow from "../../components/messages/ChatWindow/ChatWindow";
import { useMessages } from "../../context/MessageContext/MessageContext";

import "./Messages.css";

export default function Messages() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const selectedConversationId =
    searchParams.get("conversation");

  const {
    conversations,
    loading,
    error,
    refreshMessages,
    markConversationAsReadLocally,
  } = useMessages();

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id === selectedConversationId,
    ) ?? null;

  const handleSelectConversation = (
    conversationId: string,
  ) => {
    markConversationAsReadLocally(conversationId);

    setSearchParams({
      conversation: conversationId,
    });
  };

  const handleBack = () => {
    setSearchParams({});
  };

  return (
    <div className="messages">
      <header className="messages__header">
        <div>
          <h1>Messages</h1>
          <p>Your conversations with other users.</p>
        </div>
      </header>

      {loading && (
        <div
          className="messages__status"
          role="status"
          aria-live="polite"
        >
          Loading conversations...
        </div>
      )}

      {!loading && error && (
        <div
          className="messages__status messages__status--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        conversations.length === 0 && (
          <div className="messages__empty">
            <MessageCircle size={40} />

            <h2>No conversations yet</h2>

            <p>
              Start a conversation with someone from
              their profile.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        conversations.length > 0 && (
          <div className="messages__layout">
            <aside
              className={`messages__sidebar ${
                selectedConversationId
                  ? "messages__sidebar--hidden-mobile"
                  : ""
              }`}
              aria-label="Conversations"
            >
              <div className="messages__sidebar-header">
                <h2>Conversations</h2>
              </div>

              <div className="messages__list">
                {conversations.map((conversation) => {
                  const {
                    otherUser,
                    lastMessage,
                    unreadCount,
                  } = conversation;

                  const isActive =
                    conversation.id ===
                    selectedConversationId;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      className={`messages__conversation ${
                        isActive
                          ? "messages__conversation--active"
                          : ""
                      }`}
                      onClick={() =>
                        handleSelectConversation(
                          conversation.id,
                        )
                      }
                      aria-label={`Open conversation with ${otherUser.displayName}`}
                      aria-current={
                        isActive ? "true" : undefined
                      }
                    >
                      <div className="messages__avatar">
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

                      <div className="messages__conversation-info">
                        <strong>
                          {otherUser.displayName}
                        </strong>

                        <span>
                          @{otherUser.username}
                        </span>

                        {lastMessage && (
                          <p>
                            {lastMessage.content}
                          </p>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <span
                          className="messages__unread-badge"
                          aria-label={`${unreadCount} unread ${
                            unreadCount === 1
                              ? "message"
                              : "messages"
                          }`}
                        >
                          {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </aside>

            <main
              className={`messages__chat ${
                selectedConversationId
                  ? "messages__chat--visible-mobile"
                  : ""
              }`}
            >
              {selectedConversation ? (
                <ChatWindow
                  conversationId={
                    selectedConversation.id
                  }
                  otherUser={
                    selectedConversation.otherUser
                  }
                  onBack={handleBack}
                  onMessageSent={refreshMessages}
                />
              ) : (
                <div className="messages__select">
                  <MessageCircle size={42} />

                  <h2>Select a conversation</h2>

                  <p>
                    Choose a conversation to start
                    messaging.
                  </p>
                </div>
              )}
            </main>
          </div>
        )}
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  MessageCircle,
  Plus,
} from "lucide-react";
import {
  useSearchParams,
} from "react-router-dom";


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
  refreshMessages,
  markConversationAsReadLocally,
  error,
} = useMessages();;


  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id === selectedConversationId,
    );
const handleSelectConversation = (
  conversationId: string,
) => {
  markConversationAsReadLocally(conversationId);

  setSearchParams({
    conversation: conversationId,
  });
};


  function handleBack(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="messages">
      <div className="messages__header">
        <div>
          <h1>Messages</h1>
          <p>Your conversations with other users.</p>
        </div>
      </div>

      {loading && (
        <div className="messages__status">
          Loading conversations...
        </div>
      )}

      {!loading && error && (
        <div className="messages__status messages__status--error">
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
            >
              <div className="messages__sidebar-header">
                <h2>Conversations</h2>
              </div>

              <div className="messages__list">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`messages__conversation ${
                      selectedConversationId ===
                      conversation.id
                        ? "messages__conversation--active"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectConversation(
                        conversation.id,
                      )
                    }
                  >
                    <div className="messages__avatar">
                      {conversation.otherUser.avatar ? (
                        <img
                          src={
                            conversation.otherUser.avatar
                          }
                          alt={
                            conversation.otherUser
                              .displayName
                          }
                        />
                      ) : (
                        conversation.otherUser.displayName
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>

                    <div className="messages__conversation-info">
                      <strong>
                        {
                          conversation.otherUser
                            .displayName
                        }
                      </strong>

                      <span>
                        @
                        {
                          conversation.otherUser
                            .username
                        }
                      </span>

                      {conversation.lastMessage && (
                        <p>
                          {
                            conversation.lastMessage
                              .content
                          }
                        </p>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
  <span className="messages__unread-badge">
    {conversation.unreadCount > 99
      ? "99+"
      : conversation.unreadCount}
  </span>
)}

                  </button>
                ))}
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
  conversationId={selectedConversation.id}
  otherUser={selectedConversation.otherUser}
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

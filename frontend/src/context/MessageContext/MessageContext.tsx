import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getConversations,
  type Conversation,
} from "../../services/api/messageApi";

interface MessageContextValue {
  conversations: Conversation[];
  unreadCount: number;
  loading: boolean;
  refreshMessages: () => Promise<void>;
  markConversationAsReadLocally: (
    conversationId: string,
  ) => void;
  updateConversationAfterMessage: (
  conversationId: string,
  message: Conversation["lastMessage"],
) => void;
}

const MessageContext =
  createContext<MessageContextValue | undefined>(
    undefined,
  );

interface MessageProviderProps {
  children: ReactNode;
}

export function MessageProvider({
  children,
}: MessageProviderProps) {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [loading, setLoading] = useState(true);

  const refreshMessages = useCallback(async () => {
    try {
      const data = await getConversations();

      setConversations(data);
    } catch (error) {
      console.error(
        "Failed to refresh conversations:",
        error,
      );
    }
  }, []);
const updateConversationAfterMessage = useCallback(
  (
    conversationId: string,
    message: Conversation["lastMessage"],
  ) => {
    setConversations((current) => {
      const conversation = current.find(
        (item) => item.id === conversationId,
      );

      if (!conversation) {
        return current;
      }

      const updatedConversation = {
        ...conversation,
        lastMessage: message,
        updatedAt:
          message?.createdAt ??
          conversation.updatedAt,
      };

      return [
        updatedConversation,
        ...current.filter(
          (item) => item.id !== conversationId,
        ),
      ];
    });
  },
  [],
);
  const markConversationAsReadLocally = useCallback(
    (conversationId: string) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                unreadCount: 0,
              }
            : conversation,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      await refreshMessages();

      setLoading(false);
    };

    load();
  }, [refreshMessages]);

  /*
   * Refresh the conversation list every 10 seconds.
   */
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshMessages();
      }
    }, 10_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshMessages]);

  /*
   * Refresh immediately when the user returns
   * to the browser tab.
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshMessages();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [refreshMessages]);

  const unreadCount = conversations.reduce(
    (total, conversation) =>
      total + conversation.unreadCount,
    0,
  );

  return (
    <MessageContext.Provider
      value={{
    conversations,
    unreadCount,
    loading,
    refreshMessages,
    markConversationAsReadLocally,
    updateConversationAfterMessage,
  }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);

  if (!context) {
    throw new Error(
      "useMessages must be used inside MessageProvider",
    );
  }

  return context;
}

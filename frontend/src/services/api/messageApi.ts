import { apiRequest } from "./api";

export interface ConversationUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
}

export interface LastMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  otherUser: ConversationUser;
  lastMessage: LastMessage | null;
  messageCount: number;
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  read: boolean;
  conversationId: string;
  senderId: string;
  receiverId: string;
  sender: ConversationUser;
}

export interface GetConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

export interface CreateConversationResponse {
  success: boolean;
  conversation: {
    id: string;
    createdAt: string;
    updatedAt: string;
    otherUser: ConversationUser;
  };
}

export interface GetMessagesResponse {
  success: boolean;
  messages: Message[];
  page: number;
  limit: number;
  totalMessages: number;
  hasMore: boolean;
}

export interface SendMessageResponse {
  success: boolean;
  message: Message;
}

export interface MarkConversationAsReadResponse {
  success: boolean;
  message: string;
  updatedCount: number;
}

const CONVERSATIONS_ENDPOINT = "/conversations";

const getConversationEndpoint = (
  conversationId: string,
) =>
  `${CONVERSATIONS_ENDPOINT}/${encodeURIComponent(
    conversationId,
  )}`;

function validateId(value: string, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required`);
  }

  return value.trim();
}

/**
 * Get all conversations belonging to the authenticated user.
 */
export async function getConversations(): Promise<Conversation[]> {
  const response =
    await apiRequest<GetConversationsResponse>(
      CONVERSATIONS_ENDPOINT,
    );

  return response.conversations;
}

/**
 * Create a conversation or return the existing one.
 */
export async function createConversation(
  userId: string,
): Promise<CreateConversationResponse["conversation"]> {
  const normalizedUserId = validateId(
    userId,
    "User ID",
  );

  const response =
    await apiRequest<CreateConversationResponse>(
      CONVERSATIONS_ENDPOINT,
      {
        method: "POST",
        body: JSON.stringify({
          userId: normalizedUserId,
        }),
      },
    );

  return response.conversation;
}

/**
 * Get messages for a conversation.
 *
 * Messages are returned chronologically by the backend.
 */
export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 50,
): Promise<GetMessagesResponse> {
  const normalizedConversationId =
    validateId(
      conversationId,
      "Conversation ID",
    );

  const safePage = Math.max(
    Math.floor(page) || 1,
    1,
  );

  const safeLimit = Math.min(
    Math.max(Math.floor(limit) || 50, 1),
    100,
  );

  return apiRequest<GetMessagesResponse>(
    `${getConversationEndpoint(
      normalizedConversationId,
    )}/messages?page=${safePage}&limit=${safeLimit}`,
  );
}

/**
 * Send a message to a conversation.
 */
export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<Message> {
  const normalizedConversationId =
    validateId(
      conversationId,
      "Conversation ID",
    );

  if (typeof content !== "string") {
    throw new Error("Message content is required");
  }

  const normalizedContent = content.trim();

  if (!normalizedContent) {
    throw new Error("Message cannot be empty");
  }

  if (normalizedContent.length > 2000) {
    throw new Error(
      "Message cannot exceed 2000 characters",
    );
  }

  const response =
    await apiRequest<SendMessageResponse>(
      `${getConversationEndpoint(
        normalizedConversationId,
      )}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: normalizedContent,
        }),
      },
    );

  return response.message;
}

/**
 * Mark all received messages in a conversation as read.
 */
export async function markConversationAsRead(
  conversationId: string,
): Promise<MarkConversationAsReadResponse> {
  const normalizedConversationId =
    validateId(
      conversationId,
      "Conversation ID",
    );

  return apiRequest<MarkConversationAsReadResponse>(
    `${getConversationEndpoint(
      normalizedConversationId,
    )}/read`,
    {
      method: "PATCH",
    },
  );
}

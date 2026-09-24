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

interface GetConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

interface CreateConversationResponse {
  success: boolean;
  conversation: {
    id: string;
    createdAt: string;
    updatedAt: string;
    otherUser: ConversationUser;
  };
}

interface GetMessagesResponse {
  success: boolean;
  messages: Message[];
}

interface SendMessageResponse {
  success: boolean;
  message: Message;
}

export async function getConversations(): Promise<
  Conversation[]
> {
  const response =
    await apiRequest<GetConversationsResponse>(
      "/conversations",
    );

  return response.conversations;
}

export async function createConversation(
  userId: string,
): Promise<CreateConversationResponse["conversation"]> {
  const response =
    await apiRequest<CreateConversationResponse>(
      "/conversations",
      {
        method: "POST",
        body: JSON.stringify({
          userId,
        }),
      },
    );

  return response.conversation;
}

export async function getMessages(
  conversationId: string,
): Promise<Message[]> {
  const response =
    await apiRequest<GetMessagesResponse>(
      `/conversations/${conversationId}/messages`,
    );

  return response.messages;
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<Message> {
  const response =
    await apiRequest<SendMessageResponse>(
      `/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content,
        }),
      },
    );

  return response.message;
}

export async function markConversationAsRead(
  conversationId: string,
): Promise<void> {
  await apiRequest(
    `/conversations/${conversationId}/read`,
    {
      method: "PATCH",
    },
  );
}

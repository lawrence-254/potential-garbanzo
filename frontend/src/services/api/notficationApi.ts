import { apiRequest } from "./api";

export type NotificationType =
  | "FOLLOW"
  | "LIKE"
  | "COMMENT";

export interface NotificationActor {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
}

export interface NotificationPost {
  id: string;
  content: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;

  recipientId: string;
  actorId: string;
  postId?: string | null;

  actor: NotificationActor;
  post?: NotificationPost | null;
}

interface GetNotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

interface MarkNotificationResponse {
  success: boolean;
  notification: Notification;
}

export async function getNotifications(): Promise<
  Notification[]
> {
  const response =
    await apiRequest<GetNotificationsResponse>(
      "/notifications",
    );

  return response.notifications;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<Notification> {
  const response =
    await apiRequest<MarkNotificationResponse>(
      `/notifications/${notificationId}/read`,
      {
        method: "PATCH",
      },
    );

  return response.notification;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiRequest("/notifications/read-all", {
    method: "PATCH",
  });
}
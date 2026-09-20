import prisma from "../config/prisma";

interface CreateNotificationParams {
  type: "FOLLOW" | "LIKE" | "COMMENT";
  recipientId: string;
  actorId: string;
  message: string;
  postId?: string;
}

export async function createNotification({
  type,
  recipientId,
  actorId,
  message,
  postId,
}: CreateNotificationParams) {
  // Don't notify users about their own actions
  if (recipientId === actorId) {
    return null;
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        recipientId,
        actorId,
        message,
        postId: postId || null,
      },
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

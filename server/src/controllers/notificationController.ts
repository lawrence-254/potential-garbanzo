import { Response } from "express";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";
import {
  getBoundedNumber,
  getTrimmedString,
} from "../utils/validation";

//
// GET /api/notifications
//
export async function getNotifications(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = getTrimmedString(req.userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const limit = getBoundedNumber(
      req.query.limit,
      50,
      1,
      100,
    );

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: limit,

      select: {
        id: true,
        type: true,
        message: true,
        read: true,
        createdAt: true,
        recipientId: true,
        actorId: true,
        postId: true,

        actor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },

        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications",
    });
  }
}

//
// PATCH /api/notifications/:id/read
//
export async function markNotificationAsRead(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = getTrimmedString(req.userId);
    const notificationId = getTrimmedString(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
      select: {
        id: true,
        recipientId: true,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify this notification",
      });
    }

    const updatedNotification =
      await prisma.notification.update({
        where: {
          id: notificationId,
        },

        data: {
          read: true,
        },

        select: {
          id: true,
          type: true,
          message: true,
          read: true,
          createdAt: true,
          recipientId: true,
          actorId: true,
          postId: true,

          actor: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },

          post: {
            select: {
              id: true,
              content: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      notification: updatedNotification,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
}

//
// PATCH /api/notifications/read-all
//
export async function markAllNotificationsAsRead(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = getTrimmedString(req.userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        read: false,
      },

      data: {
        read: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
}

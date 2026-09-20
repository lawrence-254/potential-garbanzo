import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

//
// GET /api/notifications
//
export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      include: {
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
export async function markNotificationAsRead(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.recipientId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify this notification",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return res.status(200).json({
      success: true,
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
}

//
// PATCH /api/notifications/read-all
//
export async function markAllNotificationsAsRead(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: req.userId,
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
    console.error("Mark all notifications as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
}

import { Response } from "express";
import { Prisma } from "@prisma/client";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { createNotification } from "../services/notificationService";

export async function followUser(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { userId } = req.params;

    if (typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    try {
      await prisma.follow.create({
        data: {
          followerId: req.userId,
          followingId: userId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res.status(409).json({
          success: false,
          message: "You are already following this user",
        });
      }
      throw error;
    }

    // Notification failure should not fail the follow action
    createNotification({
      type: "FOLLOW",
      recipientId: userId,
      actorId: req.userId,
      message: "started following you",
    }).catch((err) => {
      console.error("Failed to create follow notification:", err);
    });

    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return res.status(201).json({
      success: true,
      following: true,
      followerCount,
      followingCount,
    });
  } catch (error) {
    console.error("Follow user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to follow user",
    });
  }
}

export async function unfollowUser(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { userId } = req.params;

    if (typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    try {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: req.userId,
            followingId: userId,
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({
          success: false,
          message: "You are not following this user",
        });
      }
      throw error;
    }

    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return res.status(200).json({
      success: true,
      following: false,
      followerCount,
      followingCount,
    });
  } catch (error) {
    console.error("Unfollow user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unfollow user",
    });
  }
}

export async function getFollowStatus(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { userId } = req.params;

    if (typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [follow, followerCount, followingCount] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.userId,
            followingId: userId,
          },
        },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return res.status(200).json({
      success: true,
      following: Boolean(follow),
      followerCount,
      followingCount,
    });
  } catch (error) {
    console.error("Get follow status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve follow status",
    });
  }
}

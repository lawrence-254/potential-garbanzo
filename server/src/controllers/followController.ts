import { Response } from "express";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { createNotification } from "../services/notificationService";

export async function followUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { userId } = req.params;

    if (!userId) {
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
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.userId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: "You are already following this user",
      });
    }

    await prisma.follow.create({
      data: {
        followerId: req.userId,
        followingId: userId,
      },
    });
await createNotification({
  type: "FOLLOW",
  recipientId: userId,
  actorId: req.userId,
  message: "started following you",
});
    const followerCount = await prisma.follow.count({
      where: {
        followingId: userId,
      },
    });

    return res.status(201).json({
      success: true,
      following: true,
      followerCount,
    });
  } catch (error) {
    console.error("Follow user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to follow user",
    });
  }
}

export async function unfollowUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.userId,
          followingId: userId,
        },
      },
    });

    if (!existingFollow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this user",
      });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: req.userId,
          followingId: userId,
        },
      },
    });

    const followerCount = await prisma.follow.count({
      where: {
        followingId: userId,
      },
    });

    return res.status(200).json({
      success: true,
      following: false,
      followerCount,
    });
  } catch (error) {
    console.error("Unfollow user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unfollow user",
    });
  }
}

export async function getFollowStatus(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.userId,
          followingId: userId,
        },
      },
    });

    const followerCount = await prisma.follow.count({
      where: {
        followingId: userId,
      },
    });

    const followingCount = await prisma.follow.count({
      where: {
        followerId: userId,
      },
    });

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
import { Response } from "express";
import { Prisma } from "@prisma/client";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { createNotification } from "../services/notificationService";
import {
  getTrimmedString,
  isValidUsername,
} from "../utils/validation";

/**
 * Follow a user
 * POST /api/follows/:username
 */
export async function followUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = getTrimmedString(req.userId);
    const username = getTrimmedString(req.params.username);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!username || !isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        message: "A valid username is required",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        username: username.toLowerCase(),
      },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (targetUser.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    try {
      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: targetUser.id,
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

    createNotification({
      type: "FOLLOW",
      recipientId: targetUser.id,
      actorId: userId,
      message: "started following you",
    }).catch((error) => {
      console.error(
        "Failed to create follow notification:",
        error,
      );
    });

    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({
        where: {
          followingId: targetUser.id,
        },
      }),

      prisma.follow.count({
        where: {
          followerId: targetUser.id,
        },
      }),
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

/**
 * Unfollow a user
 * DELETE /api/follows/:username
 */
export async function unfollowUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = getTrimmedString(req.userId);
    const username = getTrimmedString(req.params.username);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!username || !isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        message: "A valid username is required",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        username: username.toLowerCase(),
      },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (targetUser.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    try {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUser.id,
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
      prisma.follow.count({
        where: {
          followingId: targetUser.id,
        },
      }),

      prisma.follow.count({
        where: {
          followerId: targetUser.id,
        },
      }),
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

/**
 * Get follow status
 * GET /api/follows/:username/status
 */
export async function getFollowStatus(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = getTrimmedString(req.userId);
    const username = getTrimmedString(req.params.username);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!username || !isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        message: "A valid username is required",
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        username: username.toLowerCase(),
      },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const self = targetUser.id === userId;

    const [follow, followerCount, followingCount] =
      await Promise.all([
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: targetUser.id,
            },
          },
          select: {
            followerId: true,
          },
        }),

        prisma.follow.count({
          where: {
            followingId: targetUser.id,
          },
        }),

        prisma.follow.count({
          where: {
            followerId: targetUser.id,
          },
        }),
      ]);

    return res.status(200).json({
      success: true,
      following: Boolean(follow),
      self,
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

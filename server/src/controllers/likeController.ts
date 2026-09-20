import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { createNotification } from "../services/notificationService";

//
// POST /api/likes/:postId
//
export async function likePost(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { postId } = req.params;

    if (typeof postId !== "string" || !postId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.userId,
          postId,
        },
      },
    });

    if (existingLike) {
      return res.status(409).json({
        success: false,
        message: "Post already liked",
      });
    }

    await prisma.like.create({
      data: {
        userId: req.userId,
        postId,
      },
    });

    // Create notification (only if liking someone else's post)
    await createNotification({
      type: "LIKE",
      recipientId: post.authorId,
      actorId: req.userId,
      message: "liked your post",
      postId,
    });

    const likeCount = await prisma.like.count({
      where: { postId },
    });

    return res.status(201).json({
      success: true,
      liked: true,
      likeCount,
    });
  } catch (error) {
    console.error("Like post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to like post",
    });
  }
}

//
// DELETE /api/likes/:postId
//
export async function unlikePost(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { postId } = req.params;

    if (typeof postId !== "string" || !postId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.userId,
          postId,
        },
      },
    });

    if (!existingLike) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      });
    }

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: req.userId,
          postId,
        },
      },
    });

    const likeCount = await prisma.like.count({
      where: { postId },
    });

    return res.status(200).json({
      success: true,
      liked: false,
      likeCount,
    });
  } catch (error) {
    console.error("Unlike post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unlike post",
    });
  }
}

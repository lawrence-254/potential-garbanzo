import { Response } from "express";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { createNotification } from "../services/notificationService";

export async function createComment(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { content } = req.body;
    const { postId } = req.params;

    if (typeof postId !== "string" || !postId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    if (typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    if (trimmedContent.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 500 characters",
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

    const comment = await prisma.comment.create({
      data: {
        content: trimmedContent,
        authorId: req.userId,
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    // Don't notify the user when they comment on their own post
    if (post.authorId !== req.userId) {
      createNotification({
        type: "COMMENT",
        recipientId: post.authorId,
        actorId: req.userId,
        message: "commented on your post",
        postId,
      }).catch((err) => {
        console.error("Failed to create comment notification:", err);
      });
    }

    return res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create comment",
    });
  }
}

export async function getComments(req: AuthRequest, res: Response) {
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

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve comments",
    });
  }
}

export async function deleteComment(
  req: AuthRequest,
  res: Response
) {
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
        message: "Comment ID is required",
      });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.authorId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    await prisma.comment.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
}

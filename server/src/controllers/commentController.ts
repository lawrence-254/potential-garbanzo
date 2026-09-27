import { Response } from "express";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { createNotification } from "../services/notificationService";
import {
  getTrimmedString,
} from "../utils/validation";

export async function createComment(
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

    const postId = getTrimmedString(req.params.postId);
    const content = getTrimmedString(req.body.content);

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 500 characters",
      });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
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

    // Don't notify the user when they comment on their own post.
    if (post.authorId !== userId) {
      createNotification({
        type: "COMMENT",
        recipientId: post.authorId,
        actorId: userId,
        message: "commented on your post",
        postId,
      }).catch((error) => {
        console.error(
          "Failed to create comment notification:",
          error,
        );
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

export async function getComments(
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

    const postId = getTrimmedString(req.params.postId);

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const limitValue = Number(req.query.limit);

    const limit = Number.isFinite(limitValue)
      ? Math.min(
          Math.max(Math.floor(limitValue), 1),
          100,
        )
      : 50;

    const comments =
      await prisma.comment.findMany({
        where: {
          postId,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: limit,
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

    const id = getTrimmedString(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
      });
    }

    const comment =
      await prisma.comment.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          authorId: true,
        },
      });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own comments",
      });
    }

    await prisma.comment.delete({
      where: {
        id,
      },
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

import { Response } from "express";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middleware/authMiddleware";

export async function createPost(
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

    const { content, image } = req.body;

    if (typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const normalizedContent = content.trim();

    if (!normalizedContent) {
      return res.status(400).json({
        success: false,
        message: "Post cannot be empty",
      });
    }

    if (normalizedContent.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Post cannot exceed 500 characters",
      });
    }

    const post = await prisma.post.create({
      data: {
        content: normalizedContent,
        image:
          typeof image === "string" && image.trim()
            ? image.trim()
            : null,
        authorId: req.userId,
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

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
}

export async function getPosts(
  _req: AuthRequest,
  res: Response,
) {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
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
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve posts",
    });
  }
}
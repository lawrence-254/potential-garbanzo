import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

//
// POST /api/posts
//
export async function createPost(req: AuthRequest, res: Response) {
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
        image: typeof image === "string" && image.trim() ? image.trim() : null,
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
      post: {
        ...post,
        likeCount: 0,
        commentCount: 0,
        likedByCurrentUser: false,
      },
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
}

//
// GET /api/posts  (Home feed - own posts + following)
//
export async function getPosts(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: req.userId },
          {
            author: {
              followers: {
                some: {
                  followerId: req.userId,
                },
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit results
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId: req.userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      image: post.image,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorId: post.authorId,
      author: post.author,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      likedByCurrentUser: post.likes.length > 0,
    }));

    return res.status(200).json({
      success: true,
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve posts",
    });
  }
}

//
// DELETE /api/posts/:id
//
export async function deletePost(req: AuthRequest, res: Response) {
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
        message: "Post ID is required",
      });
    }

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Users can only delete their own posts
    if (post.authorId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    await prisma.post.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
}

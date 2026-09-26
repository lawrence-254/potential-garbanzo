import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

function getPostId(req: AuthRequest): string | null {
  const { id } = req.params;

  if (typeof id !== "string") {
    return null;
  }

  const trimmedId = id.trim();

  return trimmedId || null;
}

// GET /api/posts
// Supports: ?feed=following | ?feed=everyone
//
export async function getPosts(
  req: AuthRequest,
  res: Response
): Promise<Response> {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Read the feed type from query params
    const feedType = (req.query.feed as string)?.toLowerCase() || "following";

    // Base include that both feeds share
    const include = {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        },
      },
      images: {
        orderBy: {
          createdAt: "asc" as const,
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
    };

    let posts;

    if (feedType === "everyone") {
      // ========== EVERYONE ==========
      posts = await prisma.post.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
        include,
      });
    } else {
      // ========== FOLLOWING (default) ==========
      // Own posts + posts from users that the current user follows
      posts = await prisma.post.findMany({
        where: {
          OR: [
            {
              authorId: req.userId, // own posts
            },
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
        take: 50,
        include,
      });
    }

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      thumbnail: post.thumbnail,
      code: post.code,
      codeLanguage: post.codeLanguage,
      images: post.images,
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
// POST /api/posts
//
export async function createPost(
  req: AuthRequest,
  res: Response
): Promise<Response> {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      title,
      content,
      code,
      codeLanguage,
      thumbnailIndex,
    } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;

    const cleanTitle =
      typeof title === "string" ? title.trim() : "";

    const cleanContent =
      typeof content === "string" ? content.trim() : "";

    const cleanCode =
      typeof code === "string" && code.trim()
        ? code.trim()
        : null;

    const cleanLanguage =
      typeof codeLanguage === "string" && codeLanguage.trim()
        ? codeLanguage.trim()
        : null;

    //
    // title validation
    //
    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: "Post title is required.",
      });
    }

    if (cleanTitle.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Post title cannot exceed 200 characters.",
      });
    }

    //
    //content  Validation
    //
    if (!cleanContent) {
      return res.status(400).json({
        success: false,
        message: "Post content is required.",
      });
    }

    if (cleanContent.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Post content cannot exceed 5000 characters.",
      });
    }

    //
    // Uploaded images
    //
    const uploadedFiles = files ?? [];

    //
    // Determine thumbnail index
    //
    let selectedThumbnailIndex = 0;

    if (thumbnailIndex !== undefined) {
      const parsedIndex = Number(thumbnailIndex);

      if (
        !Number.isInteger(parsedIndex) ||
        parsedIndex < 0 ||
        parsedIndex >= uploadedFiles.length
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid thumbnail selection.",
        });
      }

      selectedThumbnailIndex = parsedIndex;
    }

    //
    // Thumbnail
    //
    const thumbnailFile =
      uploadedFiles.length > 0
        ? uploadedFiles[selectedThumbnailIndex]
        : null;

    //
    // More images
    //
    const additionalImages = uploadedFiles.filter(
      (_, index) => index !== selectedThumbnailIndex
    );

    const thumbnailUrl = thumbnailFile
      ? `/uploads/posts/${thumbnailFile.filename}`
      : null;

    //
    // Create post
    //
    const post = await prisma.post.create({
      data: {
        title: cleanTitle,
        content: cleanContent,
        thumbnail: thumbnailUrl,
        code: cleanCode,
        codeLanguage: cleanLanguage,
        authorId: req.userId,

        images: {
          create: additionalImages.map((file) => ({
            url: `/uploads/posts/${file.filename}`,
          })),
        },
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

        images: {
          orderBy: {
            createdAt: "asc",
          },
        },

        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",

      post: {
        ...post,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
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
// GET /api/posts/:id
//
export async function getPost(
  req: AuthRequest,
  res: Response
): Promise<Response> {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = getPostId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required.",
      });
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
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

        images: {
          orderBy: {
            createdAt: "asc",
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

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,

      post: {
        id: post.id,
        title: post.title,
        content: post.content,

        thumbnail: post.thumbnail,

        code: post.code,
        codeLanguage: post.codeLanguage,

        images: post.images,

        createdAt: post.createdAt,
        updatedAt: post.updatedAt,

        authorId: post.authorId,
        author: post.author,

        likeCount: post._count.likes,
        commentCount: post._count.comments,
        likedByCurrentUser: post.likes.length > 0,
      },
    });
  } catch (error) {
    console.error("Get post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load post",
    });
  }
}



//
// DELETE /api/posts/:id
//
export async function deletePost(
  req: AuthRequest,
  res: Response
): Promise<Response> {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = getPostId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    //
    // Only the owner can delete the post
    //
    if (post.authorId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    await prisma.post.delete({
      where: {
        id,
      },
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

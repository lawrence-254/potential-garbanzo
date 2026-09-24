import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

//
// GET /api/users/me
//
export async function getMyProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile",
    });
  }
}

//
// PATCH /api/users/me
//
export async function updateMyProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { displayName, bio } = req.body;

    if (!displayName || typeof displayName !== "string" || !displayName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Display name is required",
      });
    }

    if (displayName.trim().length > 50) {
      return res.status(400).json({
        success: false,
        message: "Display name cannot exceed 50 characters",
      });
    }

    if (bio !== undefined && typeof bio === "string" && bio.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Bio cannot exceed 160 characters",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        displayName: displayName.trim(),
        bio: typeof bio === "string" ? bio.trim() : "",
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatar: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        followersCount: updatedUser._count.followers,
        followingCount: updatedUser._count.following,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
}

//
// GET /api/users/:username
//
export async function getUserProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { username } = req.params;

    // Fix: narrow string | string[] → string
    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const profile = await prisma.user.findUnique({
      where: {
        username: username.trim().toLowerCase(), // matches how you store usernames
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        followers: {
          where: {
            followerId: req.userId,
          },
          select: {
            id: true,
          },
        },
        posts: {
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
            images: true,
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
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const posts = profile.posts.map((post) => ({
      id: post.id,
      content: post.content,
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
      profile: {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        avatar: profile.avatar,
        createdAt: profile.createdAt,
        followersCount: profile._count.followers,
        followingCount: profile._count.following,
        isFollowing: profile.followers.length > 0,
        posts,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile",
    });
  }
}

//
// GET /api/users/search?q=...
//
export async function searchUsers(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!query) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    if (query.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Search query is too long",
      });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: query.toLowerCase(),
            },
          },
          {
            displayName: {
              contains: query,
              // If you use PostgreSQL you can add: mode: "insensitive"
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        followers: {
          where: {
            followerId: req.userId,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        username: "asc",
      },
      take: 20,
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing: user.followers.length > 0,
    }));

    return res.status(200).json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search users",
    });
  }
}

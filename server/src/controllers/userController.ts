import { Response } from "express";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";
import {
  getBoundedNumber,
  getTrimmedString,
  isValidUsername,
} from "../utils/validation";

//
// GET /api/users/me
//
export async function getMyProfile(
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

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
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

    return res.status(200).json({
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
export async function updateMyProfile(
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

    const displayName = getTrimmedString(req.body?.displayName);

    if (!displayName) {
      return res.status(400).json({
        success: false,
        message: "Display name is required",
      });
    }

    if (displayName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Display name cannot exceed 50 characters",
      });
    }

    if (
      req.body?.bio !== undefined &&
      typeof req.body.bio !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Bio must be a string",
      });
    }

    const bio =
      typeof req.body?.bio === "string"
        ? req.body.bio.trim()
        : "";

    if (bio.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Bio cannot exceed 160 characters",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        displayName,
        bio,
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

    return res.status(200).json({
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
export async function getUserProfile(
  req: AuthRequest,
  res: Response,
) {
  try {
    const currentUserId = getTrimmedString(req.userId);
    const username = getTrimmedString(req.params.username);

    if (!currentUserId) {
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

    const profile = await prisma.user.findUnique({
      where: {
        username: username.toLowerCase(),
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
            followerId: currentUserId,
          },
          select: {
            id: true,
          },
          take: 1,
        },

        posts: {
          orderBy: {
            createdAt: "desc",
          },
          take: 50,

          select: {
            id: true,
            title: true,
            content: true,
            thumbnail: true,
            code: true,
            codeLanguage: true,
            createdAt: true,
            updatedAt: true,
            authorId: true,

            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },

            images: {
              select: {
                id: true,
                url: true,
                createdAt: true,
              },
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
                userId: currentUserId,
              },
              select: {
                id: true,
              },
              take: 1,
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
export async function searchUsers(
  req: AuthRequest,
  res: Response,
) {
  try {
    const currentUserId = getTrimmedString(req.userId);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const query = getTrimmedString(req.query.q);

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

    const limit = getBoundedNumber(
      req.query.limit,
      20,
      1,
      20,
    );

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
            followerId: currentUserId,
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },

      orderBy: {
        username: "asc",
      },

      take: limit,
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

//
// GET /api/users/suggestions
//
export async function getSuggestedUsers(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    const currentUserId = getTrimmedString(req.userId);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const limit = getBoundedNumber(
      req.query.limit,
      5,
      1,
      20,
    );

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },

        followers: {
          none: {
            followerId: currentUserId,
          },
        },
      },

      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: limit,
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "Get suggested users error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve suggested users",
    });
  }
}

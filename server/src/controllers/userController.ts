// import { Response } from "express";
// import { AuthRequest } from "../middlewares/authMiddleware";
// import { findUserById } from "../models/User";
// import  {db}  "../config/database"

// export async function getMyProfile(req: AuthRequest, res: Response) {
//   try {
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const user = findUserById(req.userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Get followers & following counts
//     const followersCount = (
//       db
//         .prepare(`SELECT COUNT(*) as count FROM follows WHERE following_id = ?`)
//         .get(user.id) as { count: number }
//     ).count;

//     const followingCount = (
//       db
//         .prepare(`SELECT COUNT(*) as count FROM follows WHERE follower_id = ?`)
//         .get(user.id) as { count: number }
//     ).count;

//     return res.json({
//       success: true,
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         displayName: user.displayName,
//         bio: user.bio,
//         avatar: user.avatar,
//         followersCount,
//         followingCount,
//         createdAt: user.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Get profile error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to retrieve profile",
//     });
//   }
// }


// export async function updateMyProfile(req: AuthRequest, res: Response) {
//   try {
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const { displayName, bio } = req.body;

//     // Validation
//     if (!displayName || !displayName.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Display name is required",
//       });
//     }

//     if (displayName.trim().length > 50) {
//       return res.status(400).json({
//         success: false,
//         message: "Display name cannot exceed 50 characters",
//       });
//     }

//     if (bio && bio.length > 160) {
//       return res.status(400).json({
//         success: false,
//         message: "Bio cannot exceed 160 characters",
//       });
//     }

//     // Update user
//     const result = db
//       .prepare(
//         `UPDATE users 
//          SET displayName = ?, bio = ?
//          WHERE id = ?`
//       )
//       .run(displayName.trim(), bio?.trim() || "", req.userId);

//     if (result.changes === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Fetch updated user
//     const user = findUserById(req.userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Get counts
//     const followersCount = (
//       db
//         .prepare(`SELECT COUNT(*) as count FROM follows WHERE following_id = ?`)
//         .get(user.id) as { count: number }
//     ).count;

//     const followingCount = (
//       db
//         .prepare(`SELECT COUNT(*) as count FROM follows WHERE follower_id = ?`)
//         .get(user.id) as { count: number }
//     ).count;

//     return res.json({
//       success: true,
//       message: "Profile updated successfully",
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         displayName: user.displayName,
//         bio: user.bio,
//         avatar: user.avatar,
//         followersCount,
//         followingCount,
//       },
//     });
//   } catch (error) {
//     console.error("Update profile error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to update profile",
//     });
//   }
// }

import { Response } from "express";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

export async function getUserProfile(
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

    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const profile = await prisma.user.findUnique({
      where: {
        username,
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

export async function searchUsers(
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

    const query =
      typeof req.query.q === "string"
        ? req.query.q.trim()
        : "";

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
              contains: query,
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
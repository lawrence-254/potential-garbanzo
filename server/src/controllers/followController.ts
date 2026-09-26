// import { Response } from "express";
// import { Prisma } from "@prisma/client";

// import prisma from "../config/prisma";
// import type { AuthRequest } from "../middlewares/authMiddleware";
// import { createNotification } from "../services/notificationService";

// export async function followUser(req: AuthRequest, res: Response) {
//   try {
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const { userId } = req.params;

//     if (typeof userId !== "string" || !userId.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     const targetUserId = userId.trim();

//     if (targetUserId === req.userId) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot follow yourself",
//       });
//     }

//     const user = await prisma.user.findUnique({
//       where: {
//         id: targetUserId,
//       },
//       select: {
//         id: true,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     try {
//       await prisma.follow.create({
//         data: {
//           followerId: req.userId,
//           followingId: targetUserId,
//         },
//       });
//     } catch (error) {
//       if (
//         error instanceof Prisma.PrismaClientKnownRequestError &&
//         error.code === "P2002"
//       ) {
//         return res.status(409).json({
//           success: false,
//           message: "You are already following this user",
//         });
//       }

//       throw error;
//     }

//     // Notification failure should not fail the follow action.
//     createNotification({
//       type: "FOLLOW",
//       recipientId: targetUserId,
//       actorId: req.userId,
//       message: "started following you",
//     }).catch((error) => {
//       console.error("Failed to create follow notification:", error);
//     });

//     const [followerCount, followingCount] = await Promise.all([
//       prisma.follow.count({
//         where: {
//           followingId: targetUserId,
//         },
//       }),
//       prisma.follow.count({
//         where: {
//           followerId: targetUserId,
//         },
//       }),
//     ]);

//     return res.status(201).json({
//       success: true,
//       following: true,
//       followerCount,
//       followingCount,
//     });
//   } catch (error) {
//     console.error("Follow user error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to follow user",
//     });
//   }
// }

// export async function unfollowUser(req: AuthRequest, res: Response) {
//   try {
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const { userId } = req.params;

//     if (typeof userId !== "string" || !userId.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     const targetUserId = userId.trim();

//     if (targetUserId === req.userId) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot unfollow yourself",
//       });
//     }

//     try {
//       await prisma.follow.delete({
//         where: {
//           followerId_followingId: {
//             followerId: req.userId,
//             followingId: targetUserId,
//           },
//         },
//       });
//     } catch (error) {
//       if (
//         error instanceof Prisma.PrismaClientKnownRequestError &&
//         error.code === "P2025"
//       ) {
//         return res.status(404).json({
//           success: false,
//           message: "You are not following this user",
//         });
//       }

//       throw error;
//     }

//     const [followerCount, followingCount] = await Promise.all([
//       prisma.follow.count({
//         where: {
//           followingId: targetUserId,
//         },
//       }),
//       prisma.follow.count({
//         where: {
//           followerId: targetUserId,
//         },
//       }),
//     ]);

//     return res.status(200).json({
//       success: true,
//       following: false,
//       followerCount,
//       followingCount,
//     });
//   } catch (error) {
//     console.error("Unfollow user error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to unfollow user",
//     });
//   }
// }

// export async function getFollowStatus(req: AuthRequest, res: Response) {
//   try {
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       });
//     }

//     const { userId } = req.params;

//     if (typeof userId !== "string" || !userId.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     const targetUserId = userId.trim();

//     const user = await prisma.user.findUnique({
//       where: {
//         id: targetUserId,
//       },
//       select: {
//         id: true,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const isSelf = targetUserId === req.userId;

//     if (isSelf) {
//       const [followerCount, followingCount] = await Promise.all([
//         prisma.follow.count({
//           where: {
//             followingId: targetUserId,
//           },
//         }),
//         prisma.follow.count({
//           where: {
//             followerId: targetUserId,
//           },
//         }),
//       ]);

//       return res.status(200).json({
//         success: true,
//         following: false,
//         self: true,
//         followerCount,
//         followingCount,
//       });
//     }

//     const [follow, followerCount, followingCount] = await Promise.all([
//       prisma.follow.findUnique({
//         where: {
//           followerId_followingId: {
//             followerId: req.userId,
//             followingId: targetUserId,
//           },
//         },
//       }),
//       prisma.follow.count({
//         where: {
//           followingId: targetUserId,
//         },
//       }),
//       prisma.follow.count({
//         where: {
//           followerId: targetUserId,
//         },
//       }),
//     ]);

//     return res.status(200).json({
//       success: true,
//       following: Boolean(follow),
//       self: false,
//       followerCount,
//       followingCount,
//     });
//   } catch (error) {
//     console.error("Get follow status error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve follow status",
//     });
//   }
// }
import { Response } from "express";
import { Prisma } from "@prisma/client";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { createNotification } from "../services/notificationService";

/**
 * Follow a user
 * POST /api/follows/:username
 */
export async function followUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    // Make sure the requester is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { username } = req.params;

    // Validate username
    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const targetUsername = username.trim();

    // Find the user by username
    const targetUser = await prisma.user.findUnique({
      where: {
        username: targetUsername,
      },
      select: {
        id: true,
        username: true,
      },
    });

    // User doesn't exist
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent following yourself
    if (targetUser.id === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Create the follow relationship
    try {
      await prisma.follow.create({
        data: {
          followerId: req.userId,
          followingId: targetUser.id,
        },
      });
    } catch (error) {
      // Already following this user
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

    // Create notification without making the follow request
    // fail if notification creation has an issue.
    createNotification({
      type: "FOLLOW",
      recipientId: targetUser.id,
      actorId: req.userId,
      message: "started following you",
    }).catch((error) => {
      console.error(
        "Failed to create follow notification:",
        error,
      );
    });

    // Get updated follower/following counts
    const [followerCount, followingCount] = await Promise.all([
      // Number of people following the target user
      prisma.follow.count({
        where: {
          followingId: targetUser.id,
        },
      }),

      // Number of people the target user follows
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
    // Make sure the requester is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { username } = req.params;

    // Validate username
    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const targetUsername = username.trim();

    // Find the user by username
    const targetUser = await prisma.user.findUnique({
      where: {
        username: targetUsername,
      },
      select: {
        id: true,
        username: true,
      },
    });

    // User doesn't exist
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent trying to unfollow yourself
    if (targetUser.id === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    // Delete the follow relationship
    try {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: req.userId,
            followingId: targetUser.id,
          },
        },
      });
    } catch (error) {
      // Follow relationship doesn't exist
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

    // Get updated follower/following counts
    const [followerCount, followingCount] = await Promise.all([
      // Number of people following the target user
      prisma.follow.count({
        where: {
          followingId: targetUser.id,
        },
      }),

      // Number of people the target user follows
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
    // Make sure the requester is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { username } = req.params;

    // Validate username
    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const targetUsername = username.trim();

    // Find the user by username
    const targetUser = await prisma.user.findUnique({
      where: {
        username: targetUsername,
      },
      select: {
        id: true,
        username: true,
      },
    });

    // User doesn't exist
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check whether this is the logged-in user's own profile
    const self = targetUser.id === req.userId;

    // Check follow relationship and get counts
    const [follow, followerCount, followingCount] =
      await Promise.all([
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: req.userId,
              followingId: targetUser.id,
            },
          },
        }),

        // Followers of the profile being viewed
        prisma.follow.count({
          where: {
            followingId: targetUser.id,
          },
        }),

        // People the profile being viewed follows
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

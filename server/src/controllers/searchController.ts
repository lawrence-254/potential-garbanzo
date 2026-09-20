import { Response } from "express";
import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

//
// GET /api/search?q=...
//
export async function search(req: AuthRequest, res: Response) {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.json({
        success: true,
        users: [],
        posts: [],
      });
    }

    if (query.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search query is too long",
      });
    }

    const [users, posts] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query } },
            { displayName: { contains: query } },
          ],
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatar: true,
        },
        orderBy: { username: "asc" },
        take: 20,
      }),

      prisma.post.findMany({
        where: {
          content: { contains: query },
        },
        select: {
          id: true,
          content: true,
          image: true,
          createdAt: true,
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
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return res.json({
      success: true,
      users,
      posts,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to perform search",
    });
  }
}

//
// GET /api/search/suggested-users
//
export async function getSuggestedUsers(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Users the current user already follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    // People followed by people we follow (mutual connections)
    const mutualConnections = await prisma.follow.findMany({
      where: {
        followerId: { in: followingIds },
        followingId: { notIn: [userId, ...followingIds] },
      },
      select: { followingId: true },
    });

    // Score recommendations by number of mutual connections
    const recommendationScores = new Map<string, number>();

    for (const connection of mutualConnections) {
      const current = recommendationScores.get(connection.followingId) ?? 0;
      recommendationScores.set(connection.followingId, current + 1);
    }

    const recommendedIds = [...recommendationScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, 10);

    let users: {
      id: string;
      username: string;
      displayName: string;
      bio: string;
      avatar: string | null;
    }[] = [];

    if (recommendedIds.length > 0) {
      const recommendedUsers = await prisma.user.findMany({
        where: { id: { in: recommendedIds } },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatar: true,
        },
      });

      // Preserve the ranking order
      const usersById = new Map(recommendedUsers.map((u) => [u.id, u]));
      users = recommendedIds
        .map((id) => usersById.get(id))
        .filter((u): u is NonNullable<typeof u> => Boolean(u));
    }

    // Fill remaining slots with newer users
    if (users.length < 10) {
      const excludedIds = [userId, ...followingIds, ...recommendedIds];

      const fallbackUsers = await prisma.user.findMany({
        where: {
          id: { notIn: excludedIds },
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatar: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10 - users.length,
      });

      users = [...users, ...fallbackUsers];
    }

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Suggested users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load suggested users",
    });
  }
}

//
// GET /api/search/explore-posts
//
export async function getExplorePosts(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const posts = await prisma.post.findMany({
      select: {
        id: true,
        content: true,
        image: true,
        createdAt: true,
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
          where: { userId: req.userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      image: post.image,
      createdAt: post.createdAt,
      author: post.author,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      likedByCurrentUser: post.likes.length > 0,
    }));

    return res.json({
      success: true,
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Explore posts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load explore posts",
    });
  }
}

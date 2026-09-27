import { Response } from "express";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

interface HashtagCount {
  hashtag: string;
  count: number;
}

const HASHTAG_REGEX = /#[a-zA-Z0-9_]+/g;

export async function getSidebarSuggestions(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: req.userId,
        },

        followers: {
          none: {
            followerId: req.userId,
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

      take: 5,
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get sidebar suggestions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve suggestions",
    });
  }
}

export async function getTrendingHashtags(
  req: AuthRequest,
  res: Response,
): Promise<Response> {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get recent posts. We derive trending hashtags from
    // title + content rather than storing a separate hashtag model.
    const posts = await prisma.post.findMany({
      select: {
        title: true,
        content: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 200,
    });

    const hashtagCounts = new Map<string, number>();

    for (const post of posts) {
      const text = `${post.title} ${post.content}`;

      const hashtags = text.match(HASHTAG_REGEX) ?? [];

      // Prevent one post from artificially increasing
      // the same hashtag multiple times.
      const uniqueHashtags = new Set(
        hashtags.map((hashtag) => hashtag.toLowerCase()),
      );

      for (const hashtag of uniqueHashtags) {
        hashtagCounts.set(
          hashtag,
          (hashtagCounts.get(hashtag) ?? 0) + 1,
        );
      }
    }

    const trending: HashtagCount[] = Array.from(
      hashtagCounts.entries(),
    )
      .map(([hashtag, count]) => ({
        hashtag,
        count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return a.hashtag.localeCompare(b.hashtag);
      })
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      trending,
    });
  } catch (error) {
    console.error("Get trending hashtags error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve trending hashtags",
    });
  }
}

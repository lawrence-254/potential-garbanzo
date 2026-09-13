import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { findUserById } from "../models/User";
import  {db}  "../config/database"

export async function getMyProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = findUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get followers & following counts
    const followersCount = (
      db
        .prepare(`SELECT COUNT(*) as count FROM follows WHERE following_id = ?`)
        .get(user.id) as { count: number }
    ).count;

    const followingCount = (
      db
        .prepare(`SELECT COUNT(*) as count FROM follows WHERE follower_id = ?`)
        .get(user.id) as { count: number }
    ).count;

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        followersCount,
        followingCount,
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


export async function updateMyProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { displayName, bio } = req.body;

    // Validation
    if (!displayName || !displayName.trim()) {
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

    if (bio && bio.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Bio cannot exceed 160 characters",
      });
    }

    // Update user
    const result = db
      .prepare(
        `UPDATE users 
         SET displayName = ?, bio = ?
         WHERE id = ?`
      )
      .run(displayName.trim(), bio?.trim() || "", req.userId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch updated user
    const user = findUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get counts
    const followersCount = (
      db
        .prepare(`SELECT COUNT(*) as count FROM follows WHERE following_id = ?`)
        .get(user.id) as { count: number }
    ).count;

    const followingCount = (
      db
        .prepare(`SELECT COUNT(*) as count FROM follows WHERE follower_id = ?`)
        .get(user.id) as { count: number }
    ).count;

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        followersCount,
        followingCount,
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
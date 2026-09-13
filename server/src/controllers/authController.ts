import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { createUser, findUserByEmail, findUserById, findUserByUsername } from "../models/User";
import { AuthRequest } from "../middlewares/authMiddleware";

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password, displayName } = req.body;

    // Validation
    if (!username || !email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    // Check if user already exists
    const existingEmail = findUserByEmail(normalizedEmail);
    const existingUsername = findUserByUsername(normalizedUsername);

    if (existingEmail || existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already in use",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = createUser({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      displayName: displayName.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: userId,
        username: normalizedUsername,
        email: normalizedEmail,
        displayName: displayName.trim(),
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating your account",
    });
  }
};
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Helper is synchronous and expects a string
    const user = findUserByEmail(email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    // SQLite uses `id` (not `_id`)
    const token = jwt.sign(
      {
        userId: user.id,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/", // ← recommended (matches default when setting the cookie)
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
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

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve current user",
    });
  }
}
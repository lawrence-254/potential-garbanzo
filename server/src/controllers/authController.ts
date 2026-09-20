import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

import prisma from "../config/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();
    const trimmedDisplayName = displayName.trim();

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Username rules
    if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters",
      });
    }

    if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username can only contain letters, numbers and underscores",
      });
    }

    // Display name
    if (trimmedDisplayName.length < 1 || trimmedDisplayName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Display name must be between 1 and 50 characters",
      });
    }

    // Password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check uniqueness
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: normalizedUsername },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already in use",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        displayName: trimmedDisplayName,
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    // Handle unique constraint race condition
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "Username or email is already in use",
      });
    }

    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating your account",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    // Always return the same message to prevent user enumeration
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

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
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
    path: "/",
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
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve current user",
    });
  }
}

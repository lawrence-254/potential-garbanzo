import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import prisma from "../config/prisma";

export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId?: unknown;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (!token || typeof token !== "string") {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      success: false,
      message: "Authentication service is not configured",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    if (
      !decoded ||
      typeof decoded.userId !== "string" ||
      !decoded.userId.trim()
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
    }

    req.userId = user.id;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}

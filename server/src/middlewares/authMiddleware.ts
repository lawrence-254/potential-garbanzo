import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string; // Prisma uses String (cuid)
}

interface JwtPayload {
  userId: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      message: "JWT configuration is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
}

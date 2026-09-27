import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import likeRoutes from "./routes/likeRoutes";
import commentRoutes from "./routes/commentRoutes";
import followRoutes from "./routes/followRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import searchRoutes from "./routes/searchRoutes";
import sidebarRoutes from "./routes/sidebarRoutes";

import {
  securityHeaders,
  apiRateLimiter,
} from "./middlewares/securityMiddleware";
import { errorMiddleware } from "./middlewares/errorMiddleware";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;
const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

// Disable Express fingerprinting
app.disable("x-powered-by");

// Security headers
app.use(securityHeaders);

// CORS
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

// Cookies
app.use(cookieParser());

// Request body limits
app.use(express.json({ limit: "1mb" }));
app.use(
  express.urlencoded({
    limit: "100kb",
    extended: true,
  }),
);

// Serve uploaded files
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads")),
);

// API rate limiting
app.use("/api", apiRateLimiter);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/sidebar", sidebarRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Techwitter API is running",
  });
});
app.use(errorMiddleware);
// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    await prisma.$disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

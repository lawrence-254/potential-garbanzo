import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/search", searchRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Royal Social API is running",
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

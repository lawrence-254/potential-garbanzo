import { Router } from "express";

import { requireAuth } from "../middlewares/authMiddleware";

import {
  getConversations,
  createConversation,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
} from "../controllers/conversationController";

const router = Router();

/**
 * Conversations
 */

// Get all conversations for the authenticated user
router.get("/", requireAuth, getConversations);

// Create or retrieve an existing conversation
router.post("/", requireAuth, createConversation);

/**
 * Messages
 */

// Get messages for a conversation
router.get(
  "/:id/messages",
  requireAuth,
  getConversationMessages,
);

// Send a message
router.post(
  "/:id/messages",
  requireAuth,
  sendMessage,
);

// Mark received messages as read
router.patch(
  "/:id/read",
  requireAuth,
  markMessagesAsRead,
);

export default router;

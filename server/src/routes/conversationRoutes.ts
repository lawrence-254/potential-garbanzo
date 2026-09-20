import { Router } from "express";
import {
  getConversations,
  createConversation,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
} from "../controllers/conversationController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", requireAuth, getConversations);
router.post("/", requireAuth, createConversation);

router.get("/:id/messages", requireAuth, getConversationMessages);
router.post("/:id/messages", requireAuth, sendMessage);
router.patch("/:id/read", requireAuth, markMessagesAsRead);

export default router;

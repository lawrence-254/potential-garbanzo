import { Router } from "express";
import {
  createComment,
  getComments,
  deleteComment,
} from "../controllers/commentController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/post/:postId", requireAuth, getComments);
router.post("/post/:postId", requireAuth, createComment);
router.delete("/:id", requireAuth, deleteComment);

export default router;

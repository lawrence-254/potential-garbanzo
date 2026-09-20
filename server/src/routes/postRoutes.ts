import { Router } from "express";
import {
  createPost,
  getPosts,
  deletePost,
} from "../controllers/postController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", requireAuth, getPosts);
router.post("/", requireAuth, createPost);
router.delete("/:id", requireAuth, deletePost);

export default router;

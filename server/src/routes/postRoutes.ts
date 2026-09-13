import { Router } from "express";

import {
  createPost,
  getPosts,
} from "../controllers/postController";

import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", requireAuth, getPosts);
router.post("/", requireAuth, createPost);

export default router;
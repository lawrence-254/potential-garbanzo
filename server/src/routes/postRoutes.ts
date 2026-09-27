import { Router } from "express";
import {
  createPost,
  getMyPosts,
  getPost,
  getPosts,
  deletePost,
} from "../controllers/postController";
import { requireAuth } from "../middlewares/authMiddleware";
import { postUpload } from "../middlewares/postUpload";

const router = Router();

router.get("/me", requireAuth, getMyPosts);
router.get("/", requireAuth, getPosts);
router.get("/:id", requireAuth, getPost);
router.post(
  "/",
  requireAuth,
  postUpload.array("images", 9),
  createPost
);
router.delete("/:id", requireAuth, deletePost);

export default router;

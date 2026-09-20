import { Router } from "express";
import { likePost, unlikePost } from "../controllers/likeController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.post("/:postId", requireAuth, likePost);
router.delete("/:postId", requireAuth, unlikePost);

export default router;

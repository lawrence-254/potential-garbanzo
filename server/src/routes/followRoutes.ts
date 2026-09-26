import { Router } from "express";
import {
  followUser,
  unfollowUser,
  getFollowStatus,
} from "../controllers/followController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();


router.post("/:username", requireAuth, followUser);
router.delete("/:username", requireAuth, unfollowUser);
router.get("/:username/status", requireAuth, getFollowStatus);

export default router;

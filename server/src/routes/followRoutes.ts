import { Router } from "express";

import {
  followUser,
  unfollowUser,
  getFollowStatus,
} from "../controllers/followController";

import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get(
  "/status/:userId",
  requireAuth,
  getFollowStatus,
);

router.post(
  "/:userId",
  requireAuth,
  followUser,
);

router.delete(
  "/:userId",
  requireAuth,
  unfollowUser,
);

export default router;
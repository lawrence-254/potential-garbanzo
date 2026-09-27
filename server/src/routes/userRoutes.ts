import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  getSuggestedUsers,
  getUserProfile,
  searchUsers,
} from "../controllers/userController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

// Current user routes
router.get("/me", requireAuth, getMyProfile);
router.patch("/me", requireAuth, updateMyProfile);

// Search users
router.get("/search", requireAuth, searchUsers);
router.get("/suggestions", requireAuth, getSuggestedUsers);

// Get another user's profile by username
router.get("/:username", requireAuth, getUserProfile);

export default router;

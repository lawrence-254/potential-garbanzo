import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
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

// Get another user's profile by username
// Important: this must come after /me and /search
router.get("/:username", requireAuth, getUserProfile);

export default router;

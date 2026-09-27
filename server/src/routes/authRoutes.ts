import { Router } from "express";
import {
  getCurrentUser,
  register,
  login,
  logout,
} from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";
import { authRateLimiter } from "../middlewares/securityMiddleware";

const router = Router();

router.post("/register", authRateLimiter,register);
router.post("/login", authRateLimiter, login);
router.post("/logout", logout);

export default router;

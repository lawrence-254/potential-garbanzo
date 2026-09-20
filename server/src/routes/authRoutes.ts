import { Router } from "express";
import {
  getCurrentUser,
  register,
  login,
  logout,
} from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, getCurrentUser);

export default router;

import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/userController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me", requireAuth, getMyProfile);
router.patch("/me", requireAuth, updateMyProfile);

export default router;
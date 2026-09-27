import { Router } from "express";

import {
  getSidebarSuggestions,
  getTrendingHashtags,
} from "../controllers/sidebarController";

import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get(
  "/suggestions",
  requireAuth,
  getSidebarSuggestions,
);

router.get(
  "/trending",
  requireAuth,
  getTrendingHashtags,
);

export default router;

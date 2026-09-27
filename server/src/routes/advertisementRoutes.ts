import { Router } from "express";

import {
  getAdvertisements,
  recordAdvertisementClick,
} from "../controllers/advertisementController";

import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", requireAuth, getAdvertisements);

router.post(
  "/:id/click",
  requireAuth,
  recordAdvertisementClick,
);

export default router;

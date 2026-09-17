import { Router } from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController";

import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  getNotifications,
);

router.patch(
  "/read-all",
  requireAuth,
  markAllNotificationsAsRead,
);

router.patch(
  "/:id/read",
  requireAuth,
  markNotificationAsRead,
);

export default router;
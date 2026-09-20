import { Router } from "express";
import {
  search,
  getSuggestedUsers,
  getExplorePosts,
} from "../controllers/searchController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", requireAuth, search);
router.get("/suggested-users", requireAuth, getSuggestedUsers);
router.get("/explore-posts", requireAuth, getExplorePosts);

export default router;

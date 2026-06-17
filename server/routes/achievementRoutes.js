import express from "express";
import { getUserAchievements, getLeaderboard } from "../controllers/achievementController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protectUser, getUserAchievements);
router.get("/leaderboard", protectUser, getLeaderboard);
export default router;
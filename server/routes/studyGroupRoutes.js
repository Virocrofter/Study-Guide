import express from "express";
import {
  getStudyGroups, createStudyGroup, joinStudyGroup, leaveStudyGroup,
  postMessage, getGroupMessages, getLeaderboard,
} from "../controllers/studyGroupController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protectUser, getStudyGroups);
router.post("/", protectUser, createStudyGroup);
router.post("/:id/join", protectUser, joinStudyGroup);
router.post("/:id/leave", protectUser, leaveStudyGroup);
router.get("/:id/messages", protectUser, getGroupMessages);
router.post("/:id/messages", protectUser, postMessage);
router.get("/leaderboard/global", protectUser, getLeaderboard);
export default router;
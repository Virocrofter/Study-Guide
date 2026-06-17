import express from "express";
import {
  getStudySessions, createStudySession, updateStudySession,
  deleteStudySession, getStudyStats,
} from "../controllers/studySessionController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protectUser, getStudySessions);
router.post("/", protectUser, createStudySession);
router.put("/:id", protectUser, updateStudySession);
router.delete("/:id", protectUser, deleteStudySession);
router.get("/stats", protectUser, getStudyStats);
export default router;
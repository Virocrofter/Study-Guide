import express from "express";
import { generateFlashcards, generateStudyGuide, generatePracticeTest } from "../controllers/aiAssistantController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/flashcards", protectUser, generateFlashcards);
router.post("/study-guide", protectUser, generateStudyGuide);
router.post("/practice-test", protectUser, generatePracticeTest);
export default router;
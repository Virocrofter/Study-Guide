import express from "express";
import {
  addUserRating,
  becomeEducator,
  getUserCourseProgress,
  getUserData,
  purchaseCourse,
  updateUserCourseProgress,
  userEnrolledCourses,
  getCourseMessages,
  sendMessage,
  getCourseMaterials,
} from "../controllers/userController.js";
import {
  getUserQuizzes,
  submitQuiz,
  getUserSubmissions,
} from "../controllers/quizController.js";
import {
  getFlashCards,
  createFlashCard,
  updateFlashCard,
  deleteFlashCard,
  reviewFlashCard,
  getFolders,
  createFolder,
  deleteFolder,
  getStudyGuides,
  createStudyGuide,
  updateStudyGuide,
  deleteStudyGuide,
  getPracticeTests,
  createPracticeTest,
  deletePracticeTest,
  attemptPracticeTest,
} from "../controllers/studyBuddyController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/data", requireAuth, getUserData);
userRouter.get("/enrolled-courses", requireAuth, userEnrolledCourses);
userRouter.post("/purchase", requireAuth, purchaseCourse);
userRouter.post("/update-course-progress", requireAuth, updateUserCourseProgress);
userRouter.post("/get-course-progress", requireAuth, getUserCourseProgress);
userRouter.post("/add-rating", requireAuth, addUserRating);
userRouter.post("/become-educator", requireAuth, becomeEducator);

userRouter.get("/messages/:courseId", requireAuth, getCourseMessages);
userRouter.post("/messages/:courseId", requireAuth, sendMessage);
userRouter.get("/materials/:courseId", requireAuth, getCourseMaterials);

userRouter.get("/quizzes/:courseId", requireAuth, getUserQuizzes);
userRouter.post("/quizzes/:quizId/submit", requireAuth, submitQuiz);
userRouter.get("/quiz-submissions", requireAuth, getUserSubmissions);

userRouter.get("/flashcards", requireAuth, getFlashCards);
userRouter.post("/flashcards", requireAuth, createFlashCard);
userRouter.put("/flashcards/:id", requireAuth, updateFlashCard);
userRouter.delete("/flashcards/:id", requireAuth, deleteFlashCard);
userRouter.post("/flashcards/:id/review", requireAuth, reviewFlashCard);

userRouter.get("/folders", requireAuth, getFolders);
userRouter.post("/folders", requireAuth, createFolder);
userRouter.delete("/folders/:id", requireAuth, deleteFolder);

userRouter.get("/study-guides", requireAuth, getStudyGuides);
userRouter.post("/study-guides", requireAuth, createStudyGuide);
userRouter.put("/study-guides/:id", requireAuth, updateStudyGuide);
userRouter.delete("/study-guides/:id", requireAuth, deleteStudyGuide);

userRouter.get("/practice-tests", requireAuth, getPracticeTests);
userRouter.post("/practice-tests", requireAuth, createPracticeTest);
userRouter.delete("/practice-tests/:id", requireAuth, deletePracticeTest);
userRouter.post("/practice-tests/:id/attempt", requireAuth, attemptPracticeTest);

export default userRouter;
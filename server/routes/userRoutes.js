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
  getLibrary,
  addLibraryItem,
  removeLibraryItem,
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
import { protectUser } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/data", protectUser, getUserData);
userRouter.get("/enrolled-courses", protectUser, userEnrolledCourses);
userRouter.post("/purchase", protectUser, purchaseCourse);
userRouter.post("/update-course-progress", protectUser, updateUserCourseProgress);
userRouter.post("/get-course-progress", protectUser, getUserCourseProgress);
userRouter.post("/add-rating", protectUser, addUserRating);
userRouter.post("/become-educator", protectUser, becomeEducator);

userRouter.get("/messages/:courseId", protectUser, getCourseMessages);
userRouter.post("/messages/:courseId", protectUser, sendMessage);
userRouter.get("/materials/:courseId", protectUser, getCourseMaterials);

userRouter.get("/quizzes/:courseId", protectUser, getUserQuizzes);
userRouter.post("/quizzes/:quizId/submit", protectUser, submitQuiz);
userRouter.get("/quiz-submissions", protectUser, getUserSubmissions);

userRouter.get("/library", protectUser, getLibrary);
userRouter.post("/library", protectUser, addLibraryItem);
userRouter.delete("/library/:itemId", protectUser, removeLibraryItem);

userRouter.get("/flashcards", protectUser, getFlashCards);
userRouter.post("/flashcards", protectUser, createFlashCard);
userRouter.put("/flashcards/:id", protectUser, updateFlashCard);
userRouter.delete("/flashcards/:id", protectUser, deleteFlashCard);
userRouter.post("/flashcards/:id/review", protectUser, reviewFlashCard);

userRouter.get("/folders", protectUser, getFolders);
userRouter.post("/folders", protectUser, createFolder);
userRouter.delete("/folders/:id", protectUser, deleteFolder);

userRouter.get("/study-guides", protectUser, getStudyGuides);
userRouter.post("/study-guides", protectUser, createStudyGuide);
userRouter.put("/study-guides/:id", protectUser, updateStudyGuide);
userRouter.delete("/study-guides/:id", protectUser, deleteStudyGuide);

userRouter.get("/practice-tests", protectUser, getPracticeTests);
userRouter.post("/practice-tests", protectUser, createPracticeTest);
userRouter.delete("/practice-tests/:id", protectUser, deletePracticeTest);
userRouter.post("/practice-tests/:id/attempt", protectUser, attemptPracticeTest);

export default userRouter;
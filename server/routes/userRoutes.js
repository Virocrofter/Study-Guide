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
import { protectUser } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/data", protectUser, getUserData);
userRouter.get("/enrolled-courses", protectUser, userEnrolledCourses);
userRouter.post("/purchase", protectUser, purchaseCourse);
userRouter.post("/update-course-progress", protectUser, updateUserCourseProgress);
userRouter.post("/get-course-progress", protectUser, getUserCourseProgress);
userRouter.post("/add-rating", protectUser, addUserRating);
userRouter.post("/become-educator", protectUser, becomeEducator);

// Messaging & Materials
userRouter.get("/messages/:courseId", protectUser, getCourseMessages);
userRouter.post("/messages/:courseId", protectUser, sendMessage);
userRouter.get("/materials/:courseId", protectUser, getCourseMaterials);

// Quizzes — NEW
userRouter.get("/quizzes/:courseId", protectUser, getUserQuizzes);
userRouter.post("/quizzes/:quizId/submit", protectUser, submitQuiz);
userRouter.get("/quiz-submissions", protectUser, getUserSubmissions);

export default userRouter;
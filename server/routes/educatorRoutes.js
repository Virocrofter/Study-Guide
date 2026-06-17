import express from "express";
import { protectEducator } from "../middleware/authMiddleware.js";
import upload from "../configs/multer.js";
import { getCourseStructure } from "../controllers/educatorController.js";
import {
  addCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
  getCourseMessages,
  sendMessage,
  getCourseMaterials,
  addMaterial,
  deleteMaterial,
} from "../controllers/educatorController.js";
import {
  getEducatorQuizzes,
  createQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";

const educatorRouter = express.Router();

educatorRouter.get("/update-role", updateRoleToEducator);
educatorRouter.post("/add-course", upload.single("thumbnailImage"), protectEducator, addCourse);
educatorRouter.get("/courses", protectEducator, getEducatorCourses);
educatorRouter.get("/dashboard", protectEducator, educatorDashboardData);
educatorRouter.get("/enrolled-students", protectEducator, getEnrolledStudentsData);

// Messaging
educatorRouter.get("/messages/:courseId", protectEducator, getCourseMessages);
educatorRouter.post("/messages/:courseId", protectEducator, sendMessage);

// Materials
educatorRouter.get("/materials/:courseId", protectEducator, getCourseMaterials);
educatorRouter.post("/materials/:courseId", protectEducator, addMaterial);
educatorRouter.delete("/materials/:materialId", protectEducator, deleteMaterial);

// Course structure
educatorRouter.get("/course-structure/:courseId", protectEducator, getCourseStructure);

// Quizzes — NEW
educatorRouter.get("/quizzes/:courseId", protectEducator, getEducatorQuizzes);
educatorRouter.post("/quizzes/:courseId", protectEducator, createQuiz);
educatorRouter.delete("/quizzes/:quizId", protectEducator, deleteQuiz);

export default educatorRouter;
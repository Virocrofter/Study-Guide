import express from "express";
import { requireEducator } from "../middleware/authMiddleware.js";
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
educatorRouter.post("/add-course", upload.single("thumbnailImage"), requireEducator, addCourse);
educatorRouter.get("/courses", requireEducator, getEducatorCourses);
educatorRouter.get("/dashboard", requireEducator, educatorDashboardData);
educatorRouter.get("/enrolled-students", requireEducator, getEnrolledStudentsData);

educatorRouter.get("/messages/:courseId", requireEducator, getCourseMessages);
educatorRouter.post("/messages/:courseId", requireEducator, sendMessage);

educatorRouter.get("/materials/:courseId", requireEducator, getCourseMaterials);
educatorRouter.post("/materials/:courseId", requireEducator, addMaterial);
educatorRouter.delete("/materials/:materialId", requireEducator, deleteMaterial);

educatorRouter.get("/course-structure/:courseId", requireEducator, getCourseStructure);

educatorRouter.get("/quizzes/:courseId", requireEducator, getEducatorQuizzes);
educatorRouter.post("/quizzes/:courseId", requireEducator, createQuiz);
educatorRouter.delete("/quizzes/:quizId", requireEducator, deleteQuiz);

export default educatorRouter;
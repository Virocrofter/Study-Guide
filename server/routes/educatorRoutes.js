import express from "express";
import { protectEducator } from "../middleware/authMiddleware.js";
import upload from "../configs/multer.js";
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

const educatorRouter = express.Router();

educatorRouter.get("/update-role", updateRoleToEducator);
educatorRouter.post("/add-course", upload.single("thumbnailImage"), protectEducator, addCourse);
educatorRouter.get("/courses", protectEducator, getEducatorCourses);
educatorRouter.get("/dashboard", protectEducator, educatorDashboardData);
educatorRouter.get("/enrolled-students", protectEducator, getEnrolledStudentsData);

// NEW: Messaging routes
educatorRouter.get("/messages/:courseId", protectEducator, getCourseMessages);
educatorRouter.post("/messages/:courseId", protectEducator, sendMessage);

// NEW: Materials routes
educatorRouter.get("/materials/:courseId", protectEducator, getCourseMaterials);
educatorRouter.post("/materials/:courseId", protectEducator, addMaterial);
educatorRouter.delete("/materials/:materialId", protectEducator, deleteMaterial);

export default educatorRouter;
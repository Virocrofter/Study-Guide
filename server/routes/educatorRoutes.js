import { protectEducator } from "../middleware/authMiddleware.js";
import express from "express";
import upload from "../configs/multer.js";
import {
  addCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
} from "../controllers/educatorController.js";
import { protectEducator } from "../middleware/authMiddleware.js";

const educatorRouter = express.Router();

// update role (requires login; role is set in Auth.js DB)
educatorRouter.get("/update-role", updateRoleToEducator);

// educator-only
educatorRouter.post("/add-course", upload.single("thumbnailImage"), protectEducator, addCourse);
educatorRouter.get("/courses", protectEducator, getEducatorCourses);
educatorRouter.get("/dashboard", protectEducator, educatorDashboardData);
educatorRouter.get("/enrolled-students", protectEducator, getEnrolledStudentsData);

export default educatorRouter;


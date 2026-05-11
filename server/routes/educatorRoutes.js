import express from 'express'; 
import { 
    addCourse, 
    educatorDashboardData, 
    getEducatorCourses, 
    getEnrolledStudentsData, 
    updateRoleToEducator 
} from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator, protectUser } from '../middleware/authMiddleware.js';

const educatorRouter = express.Router();

// Update user role to Educator (Should be protected by basic user auth)
educatorRouter.get('/update-role', protectUser, updateRoleToEducator);

// Add Course (Check auth FIRST, then handle file upload)
educatorRouter.post('/add-course', 
    protectEducator, 
    upload.single('thumbnailImage'), 
    addCourse
);

// Educator Dashboard Routes
educatorRouter.get('/courses', protectEducator, getEducatorCourses);
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData);
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData);

export default educatorRouter;
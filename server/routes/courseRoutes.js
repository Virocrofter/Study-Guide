import express from 'express';
import { getAllCourse, getCourseId, addCourse } from '../controllers/courseController.js';
import upload from '../configs/multer.js';

const courseRouter = express.Router();

// Public routes
// Access via: https://your-api.vercel.app/api/course/all
courseRouter.get('/all', getAllCourse);

// Access via: https://your-api.vercel.app/api/course/123
courseRouter.get('/:id', getCourseId);

// Access via: https://your-api.vercel.app/api/course/add-course
courseRouter.post('/add-course', upload.single('thumbnail'), addCourse);

export default courseRouter;
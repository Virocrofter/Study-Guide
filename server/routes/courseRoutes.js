import express from 'express';
import { getAllCourse, getCourseId } from '../controllers/courseController.js';

const courseRouter = express.Router();

// Public routes
courseRouter.get('/all', getAllCourse);
courseRouter.get('/:id', getCourseId);

export default courseRouter;
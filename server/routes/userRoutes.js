import express from 'express'
import { 
    addUserRating, 
    getUserCourseProgress, 
    getUserData, 
    purchaseCourse, 
    updateUserCourseProgress, 
    userEnrolledCourses 
} from '../controllers/userController.js'
import { protectUser } from '../middleware/authMiddleware.js';

const userRouter = express.Router()

// Apply protection to all user-specific routes
userRouter.get('/data', protectUser, getUserData)
userRouter.get('/enrolled-courses', protectUser, userEnrolledCourses)
userRouter.post('/purchase', protectUser, purchaseCourse)

userRouter.post('/update-course-progress', protectUser, updateUserCourseProgress)
userRouter.post('/get-course-progress', protectUser, getUserCourseProgress)
userRouter.post('/add-rating', protectUser, addUserRating)

export default userRouter
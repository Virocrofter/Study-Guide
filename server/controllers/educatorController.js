import Course from "../models/Course.js"
import { v2 as cloudinary } from 'cloudinary'
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js" // Assuming your User model is here

// 1. Update user role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        // req.user comes from our new protectUser/protectEducator middleware
        const userId = req.user.id; 

        // Update the role in your own MongoDB database instead of Clerk
        await User.findByIdAndUpdate(userId, { role: 'educator' });

        res.json({ success: true, message: 'You can now publish a course' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating role' });
    }
}

// 2. Add new course 
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.user.id;

        if (!imageFile) {
            return res.json({ success: false, message: "Thumbnail not attached" });
        }

        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.educator = educatorId;
        
        const newCourse = await Course.create(parsedCourseData);
        
        // Upload to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        newCourse.courseThumbnail = imageUpload.secure_url;
        await newCourse.save();

        res.json({ success: true, message: 'Course Added' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 3. Get Educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.user.id;
        const courses = await Course.find({ educator });
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// 4. Get educator Data (Total Earnings, Enrolled Students, No of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.user.id;
        
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        })
        .populate('userId', 'name imageUrl') 
        .populate('courseId', 'courseTitle');

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        const enrolledStudentsData = purchases.map(purchase => ({
            courseTitle: purchase.courseId ? purchase.courseId.courseTitle : "Course Deleted",
            student: purchase.userId ? purchase.userId : { name: "Unknown Student", imageUrl: "" }
        }));

        res.json({
            success: true, 
            dashboardData: {
                totalEarnings, 
                enrolledStudentsData, 
                totalCourses
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 5. Get Enrolled Student Data with Purchase Data 
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.user.id;
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'  
        }).populate('userId', 'name imageUrl')
          .populate('courseId', 'courseTitle');

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId ? purchase.courseId.courseTitle : "Unknown Course",
            createdAt: purchase.createdAt 
        }));

        res.json({ success: true, enrolledStudents });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
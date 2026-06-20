import mongoose from "mongoose"; // ← ADD THIS LINE
import { v2 as cloudinary } from 'cloudinary';
import Course from '../models/Course.js';
import connectDB from '../configs/mongodb.js';

// DROP THIS INTO your educatorController.js (or wherever addCourse lives)
// REPLACE the old addCourse function with this one

export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const thumbnailFile = req.file;
        const educatorId = req.auth?.userId;;  // ← FIXED: was req.auth.userId

        if (!educatorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!thumbnailFile) {
            return res.status(400).json({ success: false, message: 'Thumbnail is missing' });
        }

        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.isPublished = true;

        if (parsedCourseData.courseContent && Array.isArray(parsedCourseData.courseContent)) {
            parsedCourseData.courseContent.forEach((chapter) => {
                if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
                    chapter.chapterContent.forEach((lecture, index) => {
                        lecture.lectureOrder = index + 1;
                    });
                }
            });
        }

        const imageUpload = await cloudinary.uploader.upload(thumbnailFile.path, {
            resource_type: 'image',
        });

        const newCourseData = {
            ...parsedCourseData,
            educator: educatorId,
            courseThumbnail: imageUpload.secure_url,
            createdAt: Date.now(),
        };

        const newCourse = new Course(newCourseData);
        await newCourse.save();

        return res.json({ 
            success: true, 
            message: 'Course Published Successfully',
            course: newCourse 
        });

    } catch (error) {
        console.error("Add Course Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).select("-courseContent");
    return res.json({ success: true, courses });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getCourseId = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }
    return res.json({ success: true, course });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
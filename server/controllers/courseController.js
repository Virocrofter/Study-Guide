import { v2 as cloudinary } from 'cloudinary';
import Course from '../models/Course.js';

export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const thumbnailFile = req.file;
        const educatorId = req.auth.userId; 

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

export const getAllCourse = async (req, res) => {
    try {
        // Using .lean() makes queries faster and prevents some hanging issues
        const courses = await Course.find({}).lean();
        return res.json({ success: true, courses });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getCourseId = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate ID format to prevent MongoDB internal hang/crash
        if (!id || id.length !== 24) {
            return res.status(400).json({ success: false, message: "Invalid Course ID format" });
        }
        
        // 2. Populate and execute
        const course = await Course.findById(id).populate('educator').lean();
        
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        return res.json({ success: true, course });
    } catch (error) {
        console.error("Get Course Error:", error);
        // 3. ALWAYS send a response in the catch block
        return res.status(500).json({ success: false, message: error.message });
    }
};
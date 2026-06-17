import mongoose from "mongoose";
import connectDB from "../configs/mongodb.js";
import Course from "../models/Course.js";
import { v2 as cloudinary } from "cloudinary";
import { Purchase } from "../models/Purchase.js";
import { Message } from "../models/Message.js";
import { Material } from "../models/Material.js";

export const updateRoleToEducator = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const usersCollection = mongoose.connection.db.collection("users");
    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { role: "educator" } }
    );

    return res.json({ success: true, message: "You can publish a course" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating role" });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const thumbnailFile = req.file;
    const educatorId = req.auth?.().userId;

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

export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth?.().userId;
    const courses = await Course.find({ educator });
    return res.json({ success: true, courses });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth?.().userId;

    const courses = await Course.find({ educator });
    const totalCourses = courses.length;
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

    const enrolledStudentsData = purchases.map((purchase) => ({
      courseTitle: purchase.courseId ? purchase.courseId.courseTitle : "Course Deleted",
      student: purchase.userId ? purchase.userId : { name: "Unknown Student", imageUrl: "" },
    }));

    return res.json({
      success: true,
      dashboardData: { totalEarnings, enrolledStudentsData, totalCourses },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth?.().userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      createdAt: purchase.createdAt,
    }));

    return res.json({ success: true, enrolledStudents });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getCourseMessages = async (req, res) => {
  try {
    const educator = req.auth?.().userId;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course || course.educator !== educator) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const messages = await Message.find({ courseId })
      .sort({ createdAt: 1 })
      .limit(200);

    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const educator = req.auth?.().userId;
    const { courseId } = req.params;
    const { text, type, fileUrl, fileName } = req.body;

    const course = await Course.findById(courseId);
    if (!course || course.educator !== educator) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const message = await Message.create({
      courseId,
      userId: educator,
      userName: req.body.userName || "Educator",
      userImage: req.body.userImage || "",
      text,
      type: type || "text",
      fileUrl,
      fileName,
    });

    return res.json({ success: true, message: "Message sent", data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseMaterials = async (req, res) => {
  try {
    const educator = req.auth?.().userId;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course || course.educator !== educator) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const materials = await Material.find({ courseId }).sort({ createdAt: -1 });
    return res.json({ success: true, materials });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addMaterial = async (req, res) => {
  try {
    const educator = req.auth?.().userId;
    const { courseId } = req.params;
    const { title, type, url, fileName, fileSize, duration, lectureId } = req.body;

    const course = await Course.findById(courseId);
    if (!course || course.educator !== educator) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const material = await Material.create({
      courseId,
      educatorId: educator,
      title,
      type,
      url,
      fileName,
      fileSize,
      duration,
      lectureId,
    });

    course.materials.push(material._id);
    await course.save();

    return res.json({ success: true, message: "Material added", material });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const educator = req.auth?.().userId;
    const { materialId } = req.params;

    const material = await Material.findById(materialId);
    if (!material || material.educatorId !== educator) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Course.findByIdAndUpdate(material.courseId, {
      $pull: { materials: materialId },
    });

    await Material.findByIdAndDelete(materialId);
    return res.json({ success: true, message: "Material deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseStructure = async (req, res) => {
  try {
    const educator = req.auth?.().userId;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course || course.educator !== educator) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const lectures = [];
    course.courseContent?.forEach((chapter, chIndex) => {
      chapter.chapterContent?.forEach((lecture, lIndex) => {
        lectures.push({
          lectureId: lecture.lectureId,
          lectureTitle: lecture.lectureTitle,
          chapterTitle: chapter.chapterTitle,
          fullLabel: `${chIndex + 1}.${lIndex + 1} ${lecture.lectureTitle} (${chapter.chapterTitle})`,
        });
      });
    });

    return res.json({ success: true, lectures, courseTitle: course.courseTitle });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
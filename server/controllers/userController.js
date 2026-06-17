import mongoose from "mongoose";
import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";
import Stripe from "stripe";
import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import connectDB from "../configs/mongodb.js";
import { Message } from "../models/Message.js";
import { Material } from "../models/Material.js";


// NOTE: This version assumes Auth.js cookie session.
// It will auto-create a User document (your app user) from the Auth.js session if missing.
export const getUserData = async (req, res) => {
  try {
    await connectDB();

    const userId = req.auth?.().userId;
    const sessionUser = res.locals.session?.user;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let user = await User.findById(userId);

    // If the app user doesn't exist yet, create it from the Auth.js session
    if (!user) {
      const name = sessionUser?.name || "New User";
      const email = sessionUser?.email || `user_${userId}@example.com`;
      const imageUrl = sessionUser?.image || "";

      user = await User.create({
        _id: userId,
        name,
        email,
        imageUrl,
        enrolledCourses: [],
      });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error("User Data Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/become-educator
// Sets role="educator" for the Auth.js adapter user (session role) and, if present, the app User doc.
export const becomeEducator = async (req, res) => {
  try {
    await connectDB();

    const userId = req.auth?.().userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1) Update Auth.js adapter user role (used by session callback + protectEducator middleware)
    const usersCollection = mongoose.connection.db.collection("users");

    let updated = false;
    if (mongoose.isValidObjectId(userId)) {
      const r = await usersCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { role: "educator" } }
      );
      updated = r.modifiedCount > 0 || r.matchedCount > 0;
    }

    // If ObjectId path didn't match (or id isn't an ObjectId), try string _id
    if (!updated) {
      const r2 = await usersCollection.updateOne({ _id: userId }, { $set: { role: "educator" } });
      updated = r2.modifiedCount > 0 || r2.matchedCount > 0;
    }

    // 2) Best-effort: also update your app user model if it exists
    try {
      await User.findByIdAndUpdate(userId, { role: "educator" }, { new: true });
    } catch {
      // ignore - depending on how your collections are set up this may not match
    }

    return res.json({ success: true, message: "You are now an educator" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const userEnrolledCourses = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const userData = await User.findById(userId).populate({
      path: "enrolledCourses",
      select: "courseTitle courseThumbnail courseContent courseRatings educator",
    });

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const progressData = await CourseProgress.find({
      userId,
      courseId: { $in: userData.enrolledCourses.map((course) => course._id) },
    });

    const enrolledCoursesWithProgress = userData.enrolledCourses.map((course) => {
      const courseProgress = progressData.find(
        (p) => p.courseId.toString() === course._id.toString()
      );
      return {
        ...course.toObject(),
        lectureCompleted: courseProgress ? courseProgress.lectureCompleted : [],
      };
    });

    return res.json({ success: true, enrolledCourses: enrolledCoursesWithProgress });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const purchaseCourse = async (req, res) => {
  try {
    await connectDB();
    const { courseId } = req.body;
    const origin = req.headers.origin || "http://localhost:5173";
    const userId = req.auth?.().userId;

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.json({ success: false, message: "Data Not Found" });
    }

    const purchaseData = {
      courseId: courseData._id.toString(),
      userId,
      amount: Number(
        (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)
      ),
    };

    const newPurchase = await Purchase.create(purchaseData);
    const StripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLowerCase();

    const line_items = [
      {
        price_data: {
          currency,
          product_data: { name: courseData.courseTitle },
          unit_amount: Math.round(newPurchase.amount * 100),
        },
        quantity: 1,
      },
    ];

    const session = await StripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items,
      mode: "payment",
      metadata: { purchaseId: newPurchase._id.toString() },
      payment_intent_data: { metadata: { PurchaseId: newPurchase._id.toString() } },
    });

    return res.json({ success: true, session_url: session.url });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const updateUserCourseProgress = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { courseId, lectureId } = req.body;

    if (!courseId || !lectureId) {
      return res.json({ success: false, message: "Missing courseId or lectureId" });
    }

    let progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({ success: true, message: "Lecture Already Completed" });
      }
      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    return res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getUserCourseProgress = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { courseId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });
    return res.json({ success: true, progressData });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const addUserRating = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { courseId, rating } = req.body;

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Invalid Details" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.json({ success: false, message: "Course not found" });

    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some((id) => id.toString() === courseId);

    if (!user || !isEnrolled) {
      return res.json({ success: false, message: "Student has not purchased this Course" });
    }

    const existingRatingIndex = course.courseRatings.findIndex((r) => r.userId === userId);

    if (existingRatingIndex > -1) {
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      course.courseRatings.push({ userId, rating });
    }

    await course.save();
    return res.json({ success: true, message: "Rating added" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// GET /api/user/messages/:courseId
export const getCourseMessages = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { courseId } = req.params;

    // Verify user is enrolled
    const user = await User.findById(userId);
    const isEnrolled = user?.enrolledCourses?.some((id) => id.toString() === courseId);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "Not enrolled in this course" });
    }

    const messages = await Message.find({ courseId })
      .sort({ createdAt: 1 })
      .limit(200);

    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/messages/:courseId
export const sendMessage = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { courseId } = req.params;
    const { text, type, fileUrl, fileName, userName, userImage } = req.body;

    const user = await User.findById(userId);
    const isEnrolled = user?.enrolledCourses?.some((id) => id.toString() === courseId);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "Not enrolled" });
    }

    const message = await Message.create({
      courseId,
      userId,
      userName: userName || user?.name || "Student",
      userImage: userImage || user?.imageUrl || "",
      text,
      type: type || "text",
      fileUrl,
      fileName,
    });

    return res.json({ success: true, message: "Sent", data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/user/materials/:courseId
export const getCourseMaterials = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { courseId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify user is enrolled
    const user = await User.findById(userId);
    const isEnrolled = user?.enrolledCourses?.some(
      (id) => id.toString() === courseId
    );

    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "Not enrolled in this course" });
    }

    // Fetch ALL materials for this course including lectureId
    const materials = await Material.find({ courseId })
      .select("courseId educatorId title type url fileName fileSize duration lectureId createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, materials });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
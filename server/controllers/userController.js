import User from "../models/User.js";
import { Purchase } from "../models/Purchase.js";
import Stripe from "stripe";
import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import connectDB from "../configs/mongodb.js";

export const getUserData = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    // If you want to auto-sync user profiles into your extended schema,
    // you can upsert here using req.user.{name,email,image}.
    if (!user) {
      return res.json({
        success: false,
        message: "Syncing your profile...",
        isSyncing: true,
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const userEnrolledCourses = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user?.id;

    if (!userId) return res.json({ success: false, message: "Unauthorized" });

    const userData = await User.findById(userId).populate({
      path: "enrolledCourses",
      select: "courseTitle courseThumbnail courseContent courseRatings educator",
    });

    if (!userData) return res.json({ success: false, message: "User not found" });

    const progressData = await CourseProgress.find({
      userId,
      courseId: { $in: userData.enrolledCourses.map((course) => course._id) },
    });

    const enrolledCoursesWithProgress = userData.enrolledCourses.map((course) => {
      const courseProgress = progressData.find((p) => p.courseId.toString() === course._id.toString());
      return {
        ...course.toObject(),
        lectureCompleted: courseProgress ? courseProgress.lectureCompleted : [],
      };
    });

    res.json({ success: true, enrolledCourses: enrolledCoursesWithProgress });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const purchaseCourse = async (req, res) => {
  try {
    await connectDB();
    const { courseId } = req.body;
    const origin = req.headers.origin || "http://localhost:5173";
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.json({ success: false, message: "Data Not Found" });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId: userData._id,
      amount: Number(
        (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)
      ),
    };

    const newPurchase = await Purchase.create(purchaseData);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items,
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
      payment_intent_data: {
        metadata: {
          purchaseId: newPurchase._id.toString(),
        },
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateUserCourseProgress = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user?.id;
    const { courseId, lectureId } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
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

    res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserCourseProgress = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user?.id;
    const { courseId } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const progressData = await CourseProgress.findOne({ userId, courseId });
    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const addUserRating = async (req, res) => {
  try {
    await connectDB();
    const userId = req.user?.id;
    const { courseId, rating } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!courseId || !rating || rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Invalid Details" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.json({ success: false, message: "Course not found" });

    const user = await User.findById(userId);
    const isEnrolled = user?.enrolledCourses?.some((id) => id.toString() === courseId);

    if (!user || !isEnrolled) {
      return res.json({ success: false, message: "Student has not purchased this Course" });
    }

    const existingRatingIndex = course.courseRatings.findIndex(
      (r) => r.userId && r.userId.toString() === userId.toString()
    );

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

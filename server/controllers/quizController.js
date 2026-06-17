import connectDB from "../configs/mongodb.js";
import { Quiz } from "../models/Quiz.js";
import { QuizSubmission } from "../models/QuizSubmission.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

export const getEducatorQuizzes = async (req, res) => {
  try {
    await connectDB();
    const educator = req.auth?.().userId;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course || course.educator !== educator) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const quizzes = await Quiz.find({ courseId }).sort({ createdAt: -1 });
    return res.json({ success: true, quizzes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    await connectDB();
    const educator = req.auth?.().userId;
    const { courseId } = req.params;
    const { title, lectureId, questions } = req.body;

    const course = await Course.findById(courseId);
    if (!course || course.educator !== educator) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const quiz = await Quiz.create({
      courseId,
      lectureId: lectureId || null,
      title,
      questions,
      educatorId: educator,
    });

    return res.json({ success: true, message: "Quiz created", quiz });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    await connectDB();
    const educator = req.auth?.().userId;
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.educatorId !== educator) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Quiz.findByIdAndDelete(quizId);
    await QuizSubmission.deleteMany({ quizId });
    return res.json({ success: true, message: "Quiz deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserQuizzes = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { courseId } = req.params;

    const user = await User.findById(userId);
    const isEnrolled = user?.enrolledCourses?.some((id) => id.toString() === courseId);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "Not enrolled" });
    }

    const quizzes = await Quiz.find({ courseId, isPublished: true }).sort({ createdAt: -1 });
    const submissions = await QuizSubmission.find({ userId, courseId });

    const quizzesWithStatus = quizzes.map((quiz) => {
      const submission = submissions.find((s) => s.quizId.toString() === quiz._id.toString());
      return {
        ...quiz.toObject(),
        submitted: !!submission,
        score: submission?.score || null,
        percentage: submission?.percentage || null,
      };
    });

    return res.json({ success: true, quizzes: quizzesWithStatus });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

    const user = await User.findById(userId);
    const isEnrolled = user?.enrolledCourses?.some((id) => id.toString() === quiz.courseId.toString());
    if (!isEnrolled) return res.status(403).json({ success: false, message: "Not enrolled" });

    const existing = await QuizSubmission.findOne({ quizId, userId });
    if (existing) {
      return res.json({ success: false, message: "You already submitted this quiz" });
    }

    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;

    const submission = await QuizSubmission.create({
      quizId,
      userId,
      courseId: quiz.courseId,
      answers,
      score,
      totalQuestions,
      percentage,
      passed,
    });

    return res.json({
      success: true,
      message: "Quiz submitted",
      submission: {
        score,
        totalQuestions,
        percentage,
        passed,
        answers,
        correctAnswers: quiz.questions.map((q) => q.correctAnswer),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserSubmissions = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;

    const submissions = await QuizSubmission.find({ userId })
      .populate("quizId", "title")
      .populate("courseId", "courseTitle courseThumbnail")
      .sort({ createdAt: -1 });

    return res.json({ success: true, submissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
import Achievement from "../models/Achievement.js";
import { CourseProgress } from "../models/CourseProgress.js";
import { Purchase } from "../models/Purchase.js";
import { QuizSubmission } from "../models/QuizSubmission.js";
// REMOVED: import StudySession from "../models/StudySession.js";
// Using getStudyStreak from studySessionController instead to avoid duplicate model import
import { getStudyStreak } from "./studySessionController.js";
import { createNotification } from "./notificationController.js";

export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const achievements = await Achievement.find({ userId }).sort({ unlockedAt: -1 });
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    res.json({ success: true, achievements, totalPoints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const checkAndAwardAchievements = async (userId) => {
  try {
    const existing = await Achievement.find({ userId }).select("badge");
    const has = (b) => existing.some((e) => e.badge === b);

    const enrollments = await Purchase.countDocuments({ userId });
    if (enrollments >= 1 && !has("first_course")) await award(userId, "first_course", 100);
    if (enrollments >= 5 && !has("enrollment_5")) await award(userId, "enrollment_5", 250);
    if (enrollments >= 10 && !has("enrollment_10")) await award(userId, "enrollment_10", 500);

    const quizzes = await QuizSubmission.find({ userId });
    const avgScore = quizzes.length ? quizzes.reduce((s, q) => s + (q.score || 0), 0) / quizzes.length : 0;
    if (quizzes.length >= 5 && avgScore >= 90 && !has("quiz_master")) await award(userId, "quiz_master", 300);
    if (quizzes.length >= 10 && !has("practice_makes_perfect")) await award(userId, "practice_makes_perfect", 200);

    // Use getStudyStreak from studySessionController instead of direct StudySession query
    const { streak } = await getStudyStreak(userId);
    if (streak >= 7 && !has("study_streak_7")) await award(userId, "study_streak_7", 150);
    if (streak >= 30 && !has("study_streak_30")) await award(userId, "study_streak_30", 1000);

    const topScore = quizzes.some((q) => q.score === 100);
    if (topScore && !has("perfect_score")) await award(userId, "perfect_score", 500);

    const courses = await CourseProgress.find({ userId, completed: true });
    if (courses.length >= 1 && !has("course_complete")) await award(userId, "course_complete", 200);
    if (courses.length >= 5 && !has("course_complete_5")) await award(userId, "course_complete_5", 1000);

    return { success: true };
  } catch (err) {
    console.error("Achievement check error:", err);
    return { success: false, message: err.message };
  }
};

const award = async (userId, badge, points) => {
  const title = badge.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  await Achievement.create({ userId, badge, title, points, unlockedAt: new Date() });
  await createNotification(userId, `🏆 Achievement unlocked: ${title}!`, "achievement");
};

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Achievement.aggregate([
      { $group: { _id: "$userId", totalPoints: { $sum: "$points" }, count: { $sum: 1 } } },
      { $sort: { totalPoints: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          image: "$user.imageUrl",
          points: "$totalPoints",
          achievements: "$count",
        },
      },
    ]);
    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
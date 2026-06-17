import Achievement from "../models/Achievement.js";
import StudySession from "../models/StudySession.js";
import CourseProgress from "../models/CourseProgress.js";
import Purchase from "../models/Purchase.js";
import QuizSubmission from "../models/QuizSubmission.js";
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

    const sessions = await StudySession.find({ userId, completed: true });
    const streak = calculateStreak(sessions);
    if (streak >= 7 && !has("study_streak_7")) await award(userId, "study_streak_7", 150);
    if (streak >= 30 && !has("study_streak_30")) await award(userId, "study_streak_30", 1000);

    const topScore = quizzes.some((q) => q.score === 100);
    if (topScore && !has("top_scorer")) await award(userId, "top_scorer", 200);
  } catch (e) {
    console.error("Achievement check failed:", e.message);
  }
};

const award = async (userId, badge, points) => {
  await Achievement.create({ userId, badge, points });
  await createNotification(userId, "achievement", "Achievement Unlocked!", `You earned the ${badge.replace(/_/g, " ")} badge.`, "/dashboard/achievements");
};

const calculateStreak = (sessions) => {
  if (!sessions.length) return 0;
  const dates = [...new Set(sessions.map((s) => new Date(s.startTime).toDateString()))].sort();
  let streak = 1, maxStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) { streak++; maxStreak = Math.max(maxStreak, streak); }
    else streak = 1;
  }
  return maxStreak;
};

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Achievement.aggregate([
      { $group: { _id: "$userId", totalPoints: { $sum: "$points" }, badges: { $sum: 1 } } },
      { $sort: { totalPoints: -1 } },
      { $limit: 50 },
    ]);
    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
import StudySession from "../models/StudySession.js";
import { checkAndAwardAchievements } from "./achievementController.js";

export const getStudySessions = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { start, end } = req.query;
    const query = { userId };
    if (start && end) {
      query.startTime = { $gte: new Date(start), $lte: new Date(end) };
    }
    const sessions = await StudySession.find(query).sort({ startTime: -1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStudySession = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { title, description, startTime, endTime, courseId, type } = req.body;
    const session = await StudySession.create({
      userId, title, description, startTime: new Date(startTime), endTime: new Date(endTime), courseId, type,
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStudySession = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const updates = req.body;
    if (updates.completed) {
      const session = await StudySession.findOne({ _id: id, userId });
      if (session) {
        const actual = Math.round((new Date() - new Date(session.startTime)) / (1000 * 60));
        updates.actualDuration = actual;
      }
    }
    const session = await StudySession.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    if (updates.completed) await checkAndAwardAchievements(userId);
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteStudySession = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    await StudySession.deleteOne({ _id: id, userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStudyStats = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekly = await StudySession.aggregate([
      { $match: { userId, startTime: { $gte: startOfWeek } } },
      { $group: { _id: { $dayOfWeek: "$startTime" }, totalMinutes: { $sum: "$actualDuration" } } },
    ]);
    const totalMinutes = await StudySession.aggregate([
      { $match: { userId, completed: true } },
      { $group: { _id: null, total: { $sum: "$actualDuration" } } },
    ]);
    res.json({ success: true, weekly, totalMinutes: totalMinutes[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
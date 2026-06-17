import StudyGroup from "../models/StudyGroup.js";
import mongoose from "mongoose";

export const getStudyGroups = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const groups = await StudyGroup.find({
      $or: [{ "members.userId": userId }, { creatorId: userId }, { isPublic: true }],
    }).sort({ createdAt: -1 });
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStudyGroup = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { name, description, courseId, isPublic } = req.body;
    const group = await StudyGroup.create({
      name, description, courseId, creatorId: userId, isPublic: isPublic ?? false,
      members: [{ userId, role: "admin" }],
    });
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const joinStudyGroup = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const group = await StudyGroup.findById(id);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    if (group.members.some((m) => m.userId === userId)) {
      return res.status(400).json({ success: false, message: "Already a member" });
    }
    group.members.push({ userId, role: "member" });
    await group.save();
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const leaveStudyGroup = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    await StudyGroup.updateOne(
      { _id: id },
      { $pull: { members: { userId } } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const postMessage = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;
    const { text } = req.body;
    const group = await StudyGroup.findById(id);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    group.messages.push({ userId, text });
    await group.save();
    res.json({ success: true, message: group.messages[group.messages.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await StudyGroup.findById(id).select("messages");
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    res.json({ success: true, messages: group.messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const groups = await StudyGroup.aggregate([
      { $unwind: "$members" },
      { $group: { _id: "$members.userId", groupsJoined: { $sum: 1 }, messagesSent: { $sum: { $size: "$messages" } } } },
      { $sort: { groupsJoined: -1 } },
      { $limit: 50 },
    ]);
    res.json({ success: true, leaderboard: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
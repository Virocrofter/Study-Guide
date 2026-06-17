import connectDB from "../configs/mongodb.js";
import { FlashCard } from "../models/FlashCard.js";
import { StudyFolder } from "../models/StudyFolder.js";
import { StudyGuide } from "../models/StudyGuide.js";
import { PracticeTest } from "../models/PracticeTest.js";
import { LibraryItem } from "../models/LibraryItem.js";

export const getLibrary = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const items = await LibraryItem.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addLibraryItem = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { type, title, description, sourceId, sourceUrl, metadata } = req.body;
    const item = await LibraryItem.create({ userId, type, title, description, sourceId, sourceUrl, metadata });
    return res.json({ success: true, item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeLibraryItem = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { itemId } = req.params;
    await LibraryItem.findOneAndDelete({ _id: itemId, userId });
    return res.json({ success: true, message: "Removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFlashCards = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const flashcards = await FlashCard.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, flashcards });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createFlashCard = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { front, back, tags, folderId, courseId } = req.body;
    const flashcard = await FlashCard.create({
      userId,
      front,
      back,
      tags: tags || [],
      folderId: folderId || null,
      courseId: courseId || null,
      nextReview: new Date(),
    });
    return res.json({ success: true, flashcard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFlashCard = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { id } = req.params;
    const flashcard = await FlashCard.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true }
    );
    return res.json({ success: true, flashcard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFlashCard = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { id } = req.params;
    await FlashCard.findOneAndDelete({ _id: id, userId });
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewFlashCard = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { id } = req.params;
    const { quality } = req.body;

    const card = await FlashCard.findOne({ _id: id, userId });
    if (!card) return res.status(404).json({ success: false, message: "Not found" });

    const intervals = [1, 3, 7, 14];
    const masteryDelta = [0, 10, 25, 40];
    const newMastery = Math.min(100, (card.mastery || 0) + masteryDelta[quality]);
    const dayInterval = intervals[quality];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + dayInterval);

    card.mastery = newMastery;
    card.lastReviewed = new Date();
    card.nextReview = nextReview;
    card.reviewCount = (card.reviewCount || 0) + 1;
    await card.save();

    return res.json({ success: true, flashcard: card });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFolders = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const folders = await StudyFolder.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, folders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createFolder = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { name, color } = req.body;
    const folder = await StudyFolder.create({ userId, name, color: color || "#10b981" });
    return res.json({ success: true, folder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { id } = req.params;
    await StudyFolder.findOneAndDelete({ _id: id, userId });
    await FlashCard.updateMany({ folderId: id, userId }, { folderId: null });
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudyGuides = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const guides = await StudyGuide.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, guides });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createStudyGuide = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { title, courseId, content, sections, tags, isPublic } = req.body;
    const guide = await StudyGuide.create({
      userId,
      title,
      courseId: courseId || null,
      content: content || "",
      sections: sections || [],
      tags: tags || [],
      isPublic: isPublic || false,
    });
    return res.json({ success: true, guide });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudyGuide = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { id } = req.params;
    const guide = await StudyGuide.findOneAndUpdate({ _id: id, userId }, req.body, { new: true });
    return res.json({ success: true, guide });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudyGuide = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { id } = req.params;
    await StudyGuide.findOneAndDelete({ _id: id, userId });
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPracticeTests = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const tests = await PracticeTest.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, tests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPracticeTest = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { title, courseId, questions, timeLimit } = req.body;
    const test = await PracticeTest.create({
      userId,
      title,
      courseId: courseId || null,
      questions: questions || [],
      timeLimit: timeLimit || 15,
      attempts: [],
    });
    return res.json({ success: true, test });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePracticeTest = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { id } = req.params;
    await PracticeTest.findOneAndDelete({ _id: id, userId });
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const attemptPracticeTest = async (req, res) => {
  try {
    await connectDB();
    const userId = req.auth?.().userId;
    const { id } = req.params;
    const { answers, duration } = req.body;

    const test = await PracticeTest.findOne({ _id: id, userId });
    if (!test) return res.status(404).json({ success: false, message: "Test not found" });

    let score = 0;
    test.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });

    const totalQuestions = test.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;

    const attempt = { score, percentage, duration, answers, date: new Date() };
    test.attempts.push(attempt);
    await test.save();

    return res.json({
      success: true,
      result: { score, totalQuestions, percentage, passed, duration, answers, correctAnswers: test.questions.map((q) => q.correctAnswer) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

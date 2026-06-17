import SearchIndex from "../models/SearchIndex.js";
import Course from "../models/Course.js";
import { FlashCard } from "../models/FlashCard.js";
import { StudyGuide } from "../models/StudyGuide.js";
import { Material } from "../models/Material.js";
import { Quiz } from "../models/Quiz.js";

export const globalSearch = async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, results: [] });
    const query = { $text: { $search: q } };
    if (type) query.entityType = type;
    const results = await SearchIndex.find(query, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(20);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reindexAll = async (req, res) => {
  try {
    await SearchIndex.deleteMany({});
    const courses = await Course.find();
    for (const c of courses) {
      await SearchIndex.create({
        entityType: "course", entityId: c._id, title: c.courseTitle,
        description: c.courseDescription, tags: c.courseTags || [], keywords: [c.courseLevel, c.educator],
      });
    }
    const flashcards = await FlashCard.find();
    for (const f of flashcards) {
      await SearchIndex.create({
        entityType: "flashcard", entityId: f._id, title: f.question,
        description: f.answer, tags: f.tags || [], userId: f.userId,
      });
    }
    const guides = await StudyGuide.find();
    for (const g of guides) {
      await SearchIndex.create({
        entityType: "studyguide", entityId: g._id, title: g.title,
        description: g.content, tags: g.tags || [], userId: g.userId,
      });
    }
    const materials = await Material.find();
    for (const m of materials) {
      await SearchIndex.create({
        entityType: "material", entityId: m._id, title: m.title,
        description: m.description, tags: m.tags || [], courseId: m.courseId,
      });
    }
    const quizzes = await Quiz.find();
    for (const q of quizzes) {
      await SearchIndex.create({
        entityType: "quiz", entityId: q._id, title: q.title,
        description: q.description, tags: q.tags || [], courseId: q.courseId,
      });
    }
    res.json({ success: true, message: "Reindexed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

import { FlashCard } from "../models/FlashCard.js";
import { StudyGuide } from "../models/StudyGuide.js";
import { PracticeTest } from "../models/PracticeTest.js";

// Mock AI generation - replace with OpenAI/Claude API calls in production
export const generateFlashcards = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { text, count = 5 } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text is required" });
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    const flashcards = [];
    for (let i = 0; i < Math.min(count, sentences.length); i++) {
      const sentence = sentences[i].trim();
      const words = sentence.split(" ");
      const mid = Math.floor(words.length / 2);
      const question = words.slice(0, mid).join(" ") + " _______?";
      const answer = words.slice(mid).join(" ");
      const card = await FlashCard.create({
        userId, question: `Complete: ${question}`, answer, tags: ["ai-generated"],
      });
      flashcards.push(card);
    }
    res.json({ success: true, flashcards, generated: flashcards.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateStudyGuide = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { title, text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text is required" });
    const paragraphs = text.split("\n").filter((p) => p.trim().length > 10);
    const content = paragraphs.map((p, i) => `<h3>Key Point ${i + 1}</h3><p>${p}</p>`).join("");
    const guide = await StudyGuide.create({
      userId, title: title || "AI Generated Study Guide", content, tags: ["ai-generated"],
    });
    res.json({ success: true, guide });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generatePracticeTest = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { title, text, questionCount = 5 } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text is required" });
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 30);
    const questions = [];
    for (let i = 0; i < Math.min(questionCount, sentences.length); i++) {
      const sentence = sentences[i].trim();
      const words = sentence.split(" ");
      const blankIdx = Math.floor(Math.random() * words.length);
      const correct = words[blankIdx];
      const distractors = ["example", "sample", "placeholder", correct + "s"].filter((d) => d !== correct).slice(0, 3);
      questions.push({
        questionText: words.map((w, idx) => (idx === blankIdx ? "_______" : w)).join(" "),
        options: [...distractors, correct].sort(() => Math.random() - 0.5),
        correctAnswer: correct,
        explanation: `The correct word is "${correct}" based on the context.`,
      });
    }
    const test = await PracticeTest.create({
      userId, title: title || "AI Generated Practice Test", questions, tags: ["ai-generated"],
    });
    res.json({ success: true, test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
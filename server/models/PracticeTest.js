import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, default: "" },
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
  duration: { type: Number, required: true },
  answers: [{ type: Number }],
  date: { type: Date, default: Date.now },
}, { _id: false });

const practiceTestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
  title: { type: String, required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 15 },
  attempts: [attemptSchema],
}, { timestamps: true });

export const PracticeTest = mongoose.models.PracticeTest || mongoose.model("PracticeTest", practiceTestSchema);
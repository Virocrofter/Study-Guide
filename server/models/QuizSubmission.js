import mongoose from "mongoose";

const quizSubmissionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  userId: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  answers: [{ type: Number }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, default: false },
}, { timestamps: true });

export const QuizSubmission = mongoose.models.QuizSubmission || mongoose.model("QuizSubmission", quizSubmissionSchema);
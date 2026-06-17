import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
}, { _id: false });

const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  lectureId: { type: String, default: null },
  title: { type: String, required: true },
  questions: [questionSchema],
  educatorId: { type: String, required: true },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
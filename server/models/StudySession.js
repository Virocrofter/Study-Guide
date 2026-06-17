import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
  type: { type: String, enum: ["review", "practice", "quiz", "group_study", "deep_work"], default: "review" },
  completed: { type: Boolean, default: false },
  actualDuration: { type: Number, default: 0 }, // minutes
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

const StudySession = mongoose.model("StudySession", studySessionSchema);
export default StudySession;
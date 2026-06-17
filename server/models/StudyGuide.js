import mongoose from "mongoose";

const guideSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  sections: [{ title: String, content: String }],
  isPublic: { type: Boolean, default: false },
  tags: [{ type: String }],
}, { timestamps: true });

export const StudyGuide = mongoose.models.StudyGuide || mongoose.model("StudyGuide", guideSchema);
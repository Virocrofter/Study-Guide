import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: "StudyFolder", default: null },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
  front: { type: String, required: true },
  back: { type: String, required: true },
  tags: [{ type: String }],
  mastery: { type: Number, default: 0, min: 0, max: 100 },
  lastReviewed: { type: Date, default: null },
  nextReview: { type: Date, default: null },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

export const FlashCard = mongoose.models.FlashCard || mongoose.model("FlashCard", flashcardSchema);
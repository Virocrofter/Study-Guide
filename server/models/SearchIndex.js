import mongoose from "mongoose";

const searchIndexSchema = new mongoose.Schema({
  entityType: { type: String, enum: ["course", "flashcard", "studyguide", "material", "quiz"], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  tags: [String],
  keywords: [String],
  userId: { type: String, default: null },
  courseId: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true });

searchIndexSchema.index({ title: "text", description: "text", tags: "text", keywords: "text" });
const SearchIndex = mongoose.model("SearchIndex", searchIndexSchema);
export default SearchIndex;
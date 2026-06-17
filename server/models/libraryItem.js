import mongoose from "mongoose";

const libraryItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ["course", "material", "flashcard", "guide"], required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  sourceId: { type: String, required: true },
  sourceUrl: { type: String, default: "" },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const LibraryItem = mongoose.models.LibraryItem || mongoose.model("LibraryItem", libraryItemSchema);

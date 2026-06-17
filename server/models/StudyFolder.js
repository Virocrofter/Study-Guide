import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, default: "#10b981" },
}, { timestamps: true });

export const StudyFolder = mongoose.models.StudyFolder || mongoose.model("StudyFolder", folderSchema);
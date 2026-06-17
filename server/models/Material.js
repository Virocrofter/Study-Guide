import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  educatorId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["file", "video", "audio"],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    default: null,
  },
  fileSize: {
    type: String,
    default: null,
  },
  duration: {
    type: String,
    default: null,
  },
  lectureId: {
    type: String,
    default: null, // Optional: attach to specific lecture
  },
}, { timestamps: true });

export const Material = mongoose.models.Material || mongoose.model("Material", materialSchema);
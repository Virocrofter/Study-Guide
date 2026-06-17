import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userId: {
    type: String, // Auth.js user ID
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
    default: "",
  },
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "file", "image", "audio"],
    default: "text",
  },
  fileUrl: {
    type: String,
    default: null,
  },
  fileName: {
    type: String,
    default: null,
  },
}, { timestamps: true });

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
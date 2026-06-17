import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
  creatorId: { type: String, required: true },
  members: [{ userId: String, role: { type: String, enum: ["admin", "member"], default: "member" }, joinedAt: { type: Date, default: Date.now } }],
  flashcardSets: [{ type: mongoose.Schema.Types.ObjectId, ref: "FlashCard" }],
  messages: [{ userId: String, text: String, createdAt: { type: Date, default: Date.now } }],
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema);
export default StudyGroup;
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ["message", "quiz_result", "assignment_due", "achievement", "group_invite", "course_update"],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, default: "" },
  metadata: { type: Object, default: {} },
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
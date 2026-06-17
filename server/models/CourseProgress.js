import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
    completed: { type: Boolean, default: false },
    lectureCompleted: { type: [String], default: [] } 
}, { minimize: false });

export const CourseProgress = mongoose.models.CourseProgress || mongoose.model('CourseProgress', courseProgressSchema);
import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    completed: { type: Boolean, default: false }, // Changed to default: false
    // Explicitly define as an array of strings
    lectureCompleted: { type: [String], default: [] } 
}, { minimize: false });

// This prevents "OverwriteModelError" if the file is reloaded during development
export const CourseProgress = mongoose.models.CourseProgress || mongoose.model('CourseProgress', courseProgressSchema);

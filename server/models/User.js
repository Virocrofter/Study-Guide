import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Let Mongoose use default ObjectId _id (matches Auth.js adapter & Course refs)
    name: { type: String, required: true },
    email: { type: String, required: true }, // ← REMOVED unique: true
    imageUrl: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['student', 'educator', 'admin'], 
        default: 'student' 
    },
    enrolledCourses: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }], 
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
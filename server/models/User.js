import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // CRITICAL: Auth.js gives string IDs, NOT ObjectIds
    _id: { type: String, required: true },
    
    name: { type: String, required: true },
    email: { type: String, required: true },
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
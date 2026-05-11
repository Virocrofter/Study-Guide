import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Auth.js / MongoDB Adapter uses String IDs by default
    _id: { type: String, required: true },
    
    name: { type: String, required: true },
    
    email: { type: String, required: true, unique: true },
    
    // Auth.js typically uses 'image' but we'll stick to 'imageUrl' 
    // to match your existing controller logic
    imageUrl: { type: String, required: true },

    // NEW: Added for your educator logic
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

// Export the model
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
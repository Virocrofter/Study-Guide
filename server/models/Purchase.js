import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
    courseId: {
        type: String, // Changed from ObjectId to String for consistency
        ref: 'Course',
        required: true
    },
    userId: {
        type: String,
        ref: 'User',
        required: true 
    },
    amount: {
        type: Number,
        required: true 
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending'
    }
}, { timestamps: true }); // This provides the 'createdAt' date

export const Purchase = mongoose.model('Purchase', PurchaseSchema);
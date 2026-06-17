import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  badge: {
    type: String,
    enum: [
      "first_course", "quiz_master", "flashcard_ninja", "study_streak_7", "study_streak_30",
      "top_scorer", "early_bird", "night_owl", "group_leader", "helpful_peer",
      "practice_makes_perfect", "guide_creator", "material_collector", "enrollment_5", "enrollment_10"
    ],
    required: true,
  },
  points: { type: Number, default: 0 },
  unlockedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Achievement = mongoose.model("Achievement", achievementSchema);
export default Achievement;
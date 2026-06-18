import React from "react";

const badgeConfig = {
  first_course: { icon: "🎓", color: "bg-blue-100 text-blue-800", label: "First Course" },
  quiz_master: { icon: "🧠", color: "bg-purple-100 text-purple-800", label: "Quiz Master" },
  flashcard_ninja: { icon: "🥷", color: "bg-gray-100 text-gray-800", label: "Flashcard Ninja" },
  study_streak_7: { icon: "🔥", color: "bg-orange-100 text-orange-800", label: "7-Day Streak" },
  study_streak_30: { icon: "🌟", color: "bg-yellow-100 text-yellow-800", label: "30-Day Streak" },
  top_scorer: { icon: "💯", color: "bg-green-100 text-green-800", label: "Top Scorer" },
  early_bird: { icon: "🐦", color: "bg-sky-100 text-sky-800", label: "Early Bird" },
  night_owl: { icon: "🦉", color: "bg-indigo-100 text-indigo-800", label: "Night Owl" },
  group_leader: { icon: "👑", color: "bg-pink-100 text-pink-800", label: "Group Leader" },
  helpful_peer: { icon: "🤝", color: "bg-teal-100 text-teal-800", label: "Helpful Peer" },
  practice_makes_perfect: { icon: "✨", color: "bg-amber-100 text-amber-800", label: "Practice Perfect" },
  guide_creator: { icon: "✍️", color: "bg-rose-100 text-rose-800", label: "Guide Creator" },
  material_collector: { icon: "📦", color: "bg-cyan-100 text-cyan-800", label: "Collector" },
  enrollment_5: { icon: "📈", color: "bg-emerald-100 text-emerald-800", label: "5 Courses" },
  enrollment_10: { icon: "🏅", color: "bg-red-100 text-red-800", label: "10 Courses" },
};

export const GamificationBadge = ({ badge, size = "md" }) => {
  const config = badgeConfig[badge] || { icon: "🏆", color: "bg-gray-100 text-gray-800", label: badge };
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export const GamificationProgress = ({ totalPoints, nextMilestone = 1000 }) => {
  const progress = Math.min((totalPoints / nextMilestone) * 100, 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{totalPoints} pts</span>
        <span>{nextMilestone} pts</span>
      </div>
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default GamificationBadge;
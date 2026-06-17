import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const StudentSidebar = () => {
  const location = useLocation();

  const navSections = [
    {
      title: "Core",
      items: [
        { path: "/dashboard/analytics", label: "Analytics", icon: "📊" },
        { path: "/dashboard/enrollments", label: "Enrollments", icon: "🎓" },
        { path: "/dashboard/assignments", label: "Assignments", icon: "📋" },
      ],
    },
    {
      title: "Study Buddy",
      items: [
        { path: "/dashboard/library", label: "Library", icon: "📚" },
        { path: "/dashboard/flashcards", label: "Flashcards", icon: "🗂️" },
        { path: "/dashboard/study-guides", label: "Study Guides", icon: "📖" },
        { path: "/dashboard/practice-tests", label: "Practice Tests", icon: "📝" },
      ],
    },
    {
      title: "Collaboration & AI",
      items: [
        { path: "/dashboard/study-groups", label: "Study Groups", icon: "👥" },
        { path: "/dashboard/leaderboard", label: "Leaderboard", icon: "🏆" },
        { path: "/dashboard/calendar", label: "Study Calendar", icon: "📅" },
        { path: "/dashboard/ai-assistant", label: "AI Assistant", icon: "🤖" },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-gray-200 sticky top-0">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Student Hub</h2>
        <p className="text-xs text-gray-500">Your learning dashboard</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-3 text-white">
          <p className="text-xs font-medium opacity-90">Pro Tip</p>
          <p className="text-sm mt-0.5">Use the AI Assistant to generate study materials from your notes!</p>
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
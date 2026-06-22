import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const StudentSidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/student', icon: '📊', label: 'Analytics' },
    { path: '/student/enrollments', icon: '📚', label: 'My Enrollments' },
    { path: '/student/assignments', icon: '📝', label: 'Assignments' },
    { path: '/student/browse', icon: '🔍', label: 'Browse' },
    { path: '/student/library', icon: '📖', label: 'Library' },
    { path: '/student/flash-cards', icon: '🗂️', label: 'Flash Cards' },
    { path: '/student/study-guides', icon: '📋', label: 'Study Guides' },
    { path: '/student/practice-tests', icon: '✅', label: 'Practice Tests' },
    { path: '/student/study-groups', icon: '👥', label: 'Study Groups' },
    { path: '/student/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { path: '/student/calendar', icon: '📅', label: 'Calendar' },
    { path: '/student/ai-assistant', icon: '🤖', label: 'AI Assistant' },
    { path: '/student/questions', icon: '❓', label: 'Questions' },
    { path: '/student/past-questions', icon: '📜', label: 'Past Questions' },
    { path: '/student/hall-of-fame', icon: '🌟', label: 'Hall of Fame' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto shrink-0">
      <div className="p-4">
        <div className="mb-6 px-4">
          <h2 className="text-lg font-bold text-gray-800">Study Guide</h2>
          <p className="text-xs text-gray-400 mt-1">Student Dashboard</p>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/student' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/student'}
                className={({ isActive: navActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive || navActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-lg w-6 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
            👤
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">Student</p>
            <p className="text-xs text-gray-400 truncate">View Profile</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
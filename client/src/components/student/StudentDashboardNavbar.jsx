import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const StudentDashboardNavbar = () => {
  const { navigate, userData } = useContext(AppContext);

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between h-16">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/student/ai-assistant')}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="AI Assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>

        <button
          onClick={() => navigate('/student/notifications')}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative"
          title="Notifications"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <img 
            src={userData?.imageUrl || 'https://via.placeholder.com/36'} 
            alt="Profile" 
            className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{userData?.name || 'Student'}</p>
            <p className="text-xs text-gray-500">{userData?.email || 'student@example.com'}</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StudentDashboardNavbar;
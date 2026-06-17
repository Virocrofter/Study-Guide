import React, { useContext, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const learningMenuItems = [
  {
    name: "Dashboard",
    path: "/student",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: "My Enrollments",
    path: "/student/enrollments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    name: "Assignments",
    path: "/student/assignments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    name: "Browse Courses",
    path: "/course-list",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

const studyBuddyMenuItems = [
  {
    name: "Library",
    path: "/student/library",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: "Flash Cards",
    path: "/student/flash-cards",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    name: "Study Guides",
    path: "/student/study-guides",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    name: "Practice Tests",
    path: "/student/practice-tests",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

const StudentSidebar = () => {
  const { session } = useContext(AppContext);
  const location = useLocation();
  const [foldersOpen, setFoldersOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/student") return location.pathname === "/student";
    if (path === "/course-list") return location.pathname === "/course-list";
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item, isStudyBuddy = false) => {
    const active = isActive(item.path);
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200";
    const activeClasses = isStudyBuddy
      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
      : "bg-blue-600 text-white shadow-lg shadow-blue-500/25";
    const inactiveClasses = isStudyBuddy
      ? "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

    const isExternal = item.path === "/course-list";

    if (isExternal) {
      return (
        <a
          key={item.name}
          href={item.path}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = item.path;
          }}
          className={`${baseClasses} ${inactiveClasses}`}
        >
          {item.icon}
          <span>{item.name}</span>
        </a>
      );
    }

    return (
      <NavLink
        key={item.name}
        to={item.path}
        end={item.path === "/student"}
        className={({ isActive: navActive }) =>
          `${baseClasses} ${navActive ? activeClasses : inactiveClasses}`
        }
      >
        {item.icon}
        <span>{item.name}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
      </NavLink>
    );
  };

  return (
    <div className="w-72 min-h-screen bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Learning</h2>
        <p className="text-xs text-slate-500 mt-1">StudyGuide Student</p>
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              {(session?.user?.name || "S").charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{session?.user?.name || "Student"}</p>
              <p className="text-xs text-blue-100 truncate">{session?.user?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="px-4 space-y-1">
        {learningMenuItems.map((item) => renderNavItem(item, false))}
      </nav>

      <div className="mt-6 px-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-600" />
          <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Study Buddy</p>
        </div>
        <div className="h-px bg-emerald-100 mb-2" />
      </div>

      <nav className="px-4 space-y-1 pb-2">
        {renderNavItem(studyBuddyMenuItems[0], true)}

        <div>
          <button
            onClick={() => setFoldersOpen(!foldersOpen)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname.startsWith("/student/flash-cards/folder")
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="flex-1 text-left">Your Folders</span>
            <svg className={`w-4 h-4 transition-transform ${foldersOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {foldersOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <NavLink
                to="/student/flash-cards/folder/default"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-100 text-emerald-800 font-medium"
                      : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                  }`
                }
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Flash Cards
              </NavLink>
              <button
                onClick={() => { /* TODO: open new folder modal */ }}
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Folder
              </button>
            </div>
          )}
        </div>

        {studyBuddyMenuItems.slice(1).map((item) => renderNavItem(item, true))}
      </nav>

      <div className="mt-auto p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Level</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium text-slate-700">Active Learner</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSidebar;
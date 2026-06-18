import React, { useContext, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

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

// ═══════════════════════════════════════════
// NEW v2.0 MENU ITEMS
// ═══════════════════════════════════════════
const collaborationMenuItems = [
  {
    name: "Study Groups",
    path: "/student/study-groups",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: "Leaderboard",
    path: "/student/leaderboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: "Study Calendar",
    path: "/student/calendar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "AI Assistant",
    path: "/student/ai-assistant",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const StudentSidebar = () => {
  const { session, backendUrl } = useContext(AppContext);
  const location = useLocation();
  const [foldersOpen, setFoldersOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch folders on mount
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/folders`, {
          withCredentials: true,
        });
        if (data.success) setFolders(data.folders);
      } catch (err) {
        console.error("Failed to load folders", err);
      }
    };
    if (session?.user) fetchFolders();
  }, [backendUrl, session]);

  const isActive = (path) => {
    if (path === "/student") return location.pathname === "/student";
    if (path === "/course-list") return location.pathname === "/course-list";
    return location.pathname.startsWith(path);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim() || creating) return;
    setCreating(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/folders`,
        { name: newFolderName.trim(), color: "#10b981" },
        { withCredentials: true }
      );
      if (data.success) {
        setFolders((prev) => [...prev, data.folder]);
        setNewFolderName("");
        setShowModal(false);
      }
    } catch (err) {
      console.error("Create folder failed", err);
    } finally {
      setCreating(false);
    }
  };

  const renderNavItem = (item, isStudyBuddy = false, isCollab = false) => {
    const active = isActive(item.path);
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200";
    const activeClasses = isStudyBuddy
      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
      : isCollab
      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
      : "bg-blue-600 text-white shadow-lg shadow-blue-500/25";
    const inactiveClasses = isStudyBuddy
      ? "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
      : isCollab
      ? "text-slate-600 hover:bg-purple-50 hover:text-purple-900"
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
        {learningMenuItems.map((item) => renderNavItem(item, false, false))}
      </nav>

      <div className="mt-6 px-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-600" />
          <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Study Buddy</p>
        </div>
        <div className="h-px bg-emerald-100 mb-2" />
      </div>

      <nav className="px-4 space-y-1 pb-2">
        {renderNavItem(studyBuddyMenuItems[0], true, false)}

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

              {folders.map((folder) => (
                <NavLink
                  key={folder._id}
                  to={`/student/flash-cards/folder/${folder._id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-100 text-emerald-800 font-medium"
                        : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                    }`
                  }
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: folder.color || "#10b981" }}
                  />
                  <span className="truncate">{folder.name}</span>
                </NavLink>
              ))}

              <button
                onClick={() => setShowModal(true)}
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

        {studyBuddyMenuItems.slice(1).map((item) => renderNavItem(item, true, false))}
      </nav>

      {/* ═══════════════════════════════════════════
          NEW v2.0 COLLABORATION & AI SECTION
          ═══════════════════════════════════════════ */}
      <div className="mt-4 px-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-purple-600" />
          <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">Collab & AI</p>
        </div>
        <div className="h-px bg-purple-100 mb-2" />
      </div>

      <nav className="px-4 space-y-1 pb-2">
        {collaborationMenuItems.map((item) => renderNavItem(item, false, true))}
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

      {/* New Folder Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Create New Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Folder Name</label>
                <input
                  autoFocus
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Biology 101"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating || !newFolderName.trim()}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Folder"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewFolderName("");
                  }}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSidebar;
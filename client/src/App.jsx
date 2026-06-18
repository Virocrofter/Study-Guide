import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

// ─── Layouts ───
import Educator from "./pages/educator/Educator";
import StudentDashboardLayout from "./pages/student-dashboard/StudentDashboardLayout";

// ─── Public Pages ───
import Home from "./pages/student/Home";
import CourseList from "./pages/student/CoursesList";
import CourseDetails from "./pages/student/CourseDetails";
import Loading from "./components/student/Loading";

// ─── Student Dashboard Pages ───
import StudentAnalytics from "./pages/student-dashboard/StudentAnalytics";
import StudentEnrollments from "./pages/student-dashboard/StudentEnrollments";
import StudentAssignments from "./pages/student-dashboard/StudentAssignments";

// ─── Study Buddy Pages ───
import Library from "./pages/student-dashboard/Library";
import FlashCards from "./pages/student-dashboard/FlashCards";
import StudyGuides from "./pages/student-dashboard/StudyGuides";
import PracticeTests from "./pages/student-dashboard/PracticeTests";

// ─── NEW FEATURES (v2.0) ───
import StudyGroups from "./pages/student-dashboard/StudyGroups";
import Leaderboard from "./pages/student-dashboard/Leaderboard";
import StudyCalendarPage from "./pages/student-dashboard/StudyCalendarPage";
import AIStudyAssistantPage from "./pages/student-dashboard/AIStudyAssistantPage";

// ─── Educator Pages ───
import Dashboard from "./pages/educator/Dashboard";
import AddCourses from "./pages/educator/AddCourses";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import EducatorMessages from "./pages/educator/EducatorMessages";
import EducatorMaterials from "./pages/educator/EducatorMaterials";
import EducatorQuizzes from "./pages/educator/EducatorQuizzes";

const App = () => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      {/* ═══════════════════════════════════════════
          REDIRECT OLD /dashboard URLs → /student
          ═══════════════════════════════════════════ */}
      <Route path="/dashboard" element={<Navigate to="/student" replace />} />
      <Route path="/dashboard/*" element={<Navigate to="/student" replace />} />

      {/* ═══════════════════════════════════════════
          PUBLIC ROUTES
          ═══════════════════════════════════════════ */}
      <Route path="/" element={<Home />} />
      <Route path="/course-list" element={<CourseList />} />
      <Route path="/course-list/:input" element={<CourseList />} />
      <Route path="/course/:id" element={<CourseDetails />} />
      <Route path="/loading/:path" element={<Loading />} />

      {/* ═══════════════════════════════════════════
          STUDENT DASHBOARD (with sidebar layout)
          ═══════════════════════════════════════════ */}
      <Route path="/student" element={<StudentDashboardLayout />}>
        {/* Core */}
        <Route index element={<StudentAnalytics />} />
        <Route path="enrollments" element={<StudentEnrollments />} />
        <Route path="assignments" element={<StudentAssignments />} />

        {/* Study Buddy */}
        <Route path="library" element={<Library />} />
        <Route path="flash-cards" element={<FlashCards />} />
        <Route path="flash-cards/folder/:folderId" element={<FlashCards />} />
        <Route path="study-guides" element={<StudyGuides />} />
        <Route path="practice-tests" element={<PracticeTests />} />

        {/* NEW v2.0 Features */}
        <Route path="study-groups" element={<StudyGroups />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="calendar" element={<StudyCalendarPage />} />
        <Route path="ai-assistant" element={<AIStudyAssistantPage />} />
      </Route>

      {/* ═══════════════════════════════════════════
          EDUCATOR DASHBOARD (with sidebar layout)
          ═══════════════════════════════════════════ */}
      <Route path="/educator" element={<Educator />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="add-course" element={<AddCourses />} />
        <Route path="my-courses" element={<MyCourses />} />
        <Route path="students-enrolled" element={<StudentsEnrolled />} />
        <Route path="messages" element={<EducatorMessages />} />
        <Route path="materials" element={<EducatorMaterials />} />
        <Route path="quizzes" element={<EducatorQuizzes />} />
      </Route>

      {/* ═══════════════════════════════════════════
          404 / CATCH-ALL
          ═══════════════════════════════════════════ */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-gray-600 mb-6">Page not found.</p>
              <a href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default App;
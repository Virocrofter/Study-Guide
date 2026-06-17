import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// ─── Layouts ───
import Educator from "./pages/educator/Educator";
import StudentDashboardLayout from "./pages/student/StudentDashboardLayout";

// ─── Public Pages ───
import Home from "./pages/student/Home";
import CourseList from "./pages/student/CourseList";
import CourseDetails from "./pages/student/CourseDetails";
import Loading from "./components/student/Loading";

// ─── Student Dashboard Pages ───
import StudentAnalytics from "./pages/student-dashboard/StudentAnalytics";
import StudentEnrollments from "./pages/student-dashboard/StudentEnrollments";
import StudentAssignments from "./pages/student-dashboard/StudentAssignments";

// ─── Study Buddy Pages (NEW) ───
import Library from "./pages/student-dashboard/Library";
import FlashCards from "./pages/student-dashboard/FlashCards";
import StudyGuides from "./pages/student-dashboard/StudyGuides";
import PracticeTests from "./pages/student-dashboard/PracticeTests";

// ─── Educator Pages ───
import Dashboard from "./pages/educator/Dashboard";
import AddCourses from "./pages/educator/AddCourses";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import EducatorMessages from "./pages/educator/EducatorMessages";
import EducatorMaterials from "./pages/educator/EducatorMaterials";
import EducatorQuizzes from "./pages/educator/EducatorQuizzes"; // NEW

const App = () => {
  const location = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      {/* ═══════════════════════════════════════════
          PUBLIC ROUTES
      ═══════════════════════════════════════════ */}
      <Route path="/" element={<Home />} />
      <Route path="/course-list" element={<CourseList />} />
      <Route path="/course-list/:search" element={<CourseList />} />
      <Route path="/course/:id" element={<CourseDetails />} />
      <Route path="/loading/:path" element={<Loading />} />

      {/* ═══════════════════════════════════════════
          STUDENT DASHBOARD (with sidebar layout)
      ═══════════════════════════════════════════ */}
      <Route element={<StudentDashboardLayout />}>
        {/* Core */}
        <Route path="/student" element={<StudentAnalytics />} />
        <Route path="/student/enrollments" element={<StudentEnrollments />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />

        {/* Study Buddy (NEW) */}
        <Route path="/student/library" element={<Library />} />
        <Route path="/student/flash-cards" element={<FlashCards />} />
        <Route path="/student/flash-cards/folder/:folderId" element={<FlashCards />} />
        <Route path="/student/study-guides" element={<StudyGuides />} />
        <Route path="/student/practice-tests" element={<PracticeTests />} />
      </Route>

      {/* ═══════════════════════════════════════════
          EDUCATOR DASHBOARD (with sidebar layout)
      ═══════════════════════════════════════════ */}
      <Route element={<Educator />}>
        <Route path="/educator" element={<Dashboard />} />
        <Route path="/educator/dashboard" element={<Dashboard />} />
        <Route path="/educator/add-course" element={<AddCourses />} />
        <Route path="/educator/my-courses" element={<MyCourses />} />
        <Route path="/educator/students-enrolled" element={<StudentsEnrolled />} />
        <Route path="/educator/messages" element={<EducatorMessages />} />
        <Route path="/educator/materials" element={<EducatorMaterials />} />
        <Route path="/educator/quizzes" element={<EducatorQuizzes />} /> {/* NEW */}
      </Route>

      {/* ═══════════════════════════════════════════
          404 / CATCH-ALL
      ═══════════════════════════════════════════ */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
              <p className="text-slate-500 mb-6">Page not found.</p>
              <a
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
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
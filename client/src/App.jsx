import React, { lazy, Suspense } from "react";
import { Route, Routes, useMatch } from "react-router-dom";
import Home from "./pages/student/Home";
import CoursesList from "./pages/student/CoursesList";
import CourseDetails from "./pages/student/CourseDetails";
import MyEnrollments from "./pages/student/MyEnrollments";
import Player from "./pages/student/Player";
import Loading from "./components/student/Loading";
import Educator from "./pages/educator/Educator";
import Dashboard from "./pages/educator/Dashboard";
import AddCourses from "./pages/educator/AddCourses";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import EducatorMessages from "./pages/educator/EducatorMessages";
import EducatorMaterials from "./pages/educator/EducatorMaterials";
import Navbar from "./components/student/Navbar";
import About from "./components/student/About";
import "quill/dist/quill.snow.css";
import { ToastContainer } from "react-toastify";

// Lazy load student dashboard (won't break build if files missing)
const StudentDashboardLayout = lazy(() => import("./pages/student/StudentDashboardLayout"));
const StudentAnalytics = lazy(() => import("./pages/student/StudentAnalytics"));
const StudentEnrollmentsPage = lazy(() => import("./pages/student/StudentEnrollments"));
const StudentAssignments = lazy(() => import("./pages/student/StudentAssignments"));

const App = () => {
  const isEducatorRoute = useMatch("/educator/*");
  const isStudentDashboardRoute = useMatch("/student/*");

  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer />
      {!isEducatorRoute && !isStudentDashboardRoute && <Navbar />}

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/course-list" element={<CoursesList />} />
          <Route path="/course-list/:input" element={<CoursesList />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/my-enrollments" element={<MyEnrollments />} />
          <Route path="/player/:courseId" element={<Player />} />
          <Route path="/loading/:path" element={<Loading />} />

          {/* Student Dashboard */}
          <Route path="/student" element={<StudentDashboardLayout />}>
            <Route path="/student" element={<StudentAnalytics />} />
            <Route path="enrollments" element={<StudentEnrollmentsPage />} />
            <Route path="assignments" element={<StudentAssignments />} />
          </Route>

          {/* Educator Routes */}
          <Route path="/educator" element={<Educator />}>
            <Route path="/educator" element={<Dashboard />} />
            <Route path="add-course" element={<AddCourses />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="students-enrolled" element={<StudentsEnrolled />} />
            <Route path="messages" element={<EducatorMessages />} />
            <Route path="materials" element={<EducatorMaterials />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
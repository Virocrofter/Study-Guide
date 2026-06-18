import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../../components/student/StudentSidebar";
import StudentDashboardNavbar from "../../components/student/StudentDashboardNavbar";

const StudentDashboardLayout = () => {
  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <StudentSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <StudentDashboardNavbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;
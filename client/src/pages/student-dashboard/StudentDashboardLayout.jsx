import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentDashboardNavbar from '../../components/student/StudentDashboardNavbar';

const StudentDashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StudentSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StudentDashboardNavbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;
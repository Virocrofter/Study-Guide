import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { backendUrl, isEducator, currency } = useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/dashboard`, {
        withCredentials: true,
      });
      if (data.success) setDashboardData(data.dashboardData);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        withCredentials: true,
      });
      if (data.success) setRecentCourses(data.courses.slice(0, 3));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isEducator) {
      fetchDashboard();
      fetchCourses();
    }
  }, [isEducator]);

  if (!dashboardData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Earnings",
      value: `${currency}${dashboardData.totalEarnings.toFixed(2)}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Total Courses",
      value: dashboardData.totalCourses,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      label: "Enrollments",
      value: dashboardData.enrolledStudentsData.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
  ];

  return (
    <div className="h-full pb-20 space-y-8 ml-64 pt-8 px-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">Track your teaching performance and student engagement.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.text}`}>
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">This month</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Recent Enrollments</h2>
            <button onClick={() => navigate("/educator/students-enrolled")} className="text-sm text-blue-600 font-medium hover:text-blue-700">
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {dashboardData.enrolledStudentsData.length > 0 ? (
              dashboardData.enrolledStudentsData.slice(0, 5).map((item, index) => (
                <div key={index} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                    {(item.student?.name || "S").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{item.student?.name || "Unknown Student"}</p>
                    <p className="text-xs text-slate-500">{item.courseTitle}</p>
                  </div>
                  <span className="text-xs text-slate-400">Just now</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">No enrollments yet</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/educator/add-course")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create New Course
              </button>
              <button
                onClick={() => navigate("/educator/messages")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Check Messages
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Your Courses</h2>
            <div className="space-y-3">
              {recentCourses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => navigate("/educator/my-courses")}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <img src={course.courseThumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{course.courseTitle}</p>
                    <p className="text-xs text-slate-500">{course.enrolledStudents?.length || 0} students</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
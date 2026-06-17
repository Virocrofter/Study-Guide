import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentAnalytics = () => {
  const { enrolledCourses, calculateCourseDuration, userData, fetchUserEnrolledCourses, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    if (userData) fetchUserEnrolledCourses();
  }, [userData]);

  useEffect(() => {
    const fetchAllProgress = async () => {
      const progress = [];
      for (const course of enrolledCourses || []) {
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { withCredentials: true }
          );
          progress.push({ courseId: course._id, data: data.progressData });
        } catch (e) {
          progress.push({ courseId: course._id, data: null });
        }
      }
      setProgressData(progress);
    };
    if (enrolledCourses?.length > 0) fetchAllProgress();
  }, [enrolledCourses, backendUrl]);

  const getProgressPct = (course) => {
    const totalLectures = course.courseContent?.reduce(
      (acc, ch) => acc + (ch.chapterContent?.length || 0), 0
    ) || 0;
    const completed = course.lectureCompleted?.length || 0;
    return totalLectures > 0 ? Math.round((completed * 100) / totalLectures) : 0;
  };

  const totalCourses = enrolledCourses?.length || 0;
  const completedCourses = enrolledCourses?.filter((c) => getProgressPct(c) === 100).length || 0;
  const inProgress = totalCourses - completedCourses;
  const totalHours = enrolledCourses?.reduce((acc, c) => {
    const mins = c.courseContent?.reduce((a, ch) => a + (ch.chapterContent?.reduce((b, l) => b + (l.lectureDuration || 0), 0) || 0), 0) || 0;
    return acc + mins;
  }, 0) || 0;

  const stats = [
    {
      label: "Courses Enrolled",
      value: totalCourses,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      label: "Completed",
      value: completedCourses,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      label: "Hours Learned",
      value: Math.round(totalHours / 60),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
  ];

  return (
    <div className="h-full pb-20 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Track your learning progress and achievements.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.text} mb-4`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Continue Learning</h2>
          <button onClick={() => navigate("/student/enrollments")} className="text-sm text-blue-600 font-medium hover:text-blue-700">
            View All
          </button>
        </div>

        {enrolledCourses?.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.slice(0, 3).map((course) => {
              const pct = getProgressPct(course);
              const totalLectures = course.courseContent?.reduce((acc, ch) => acc + (ch.chapterContent?.length || 0), 0) || 0;
              const completed = course.lectureCompleted?.length || 0;

              // Determine button text and destination
              let buttonText = "Continue";
              let destination = `/player/${course._id}`;

              if (pct === 0) {
                buttonText = "Start Course";
                destination = `/course/${course._id}`; // ← Goes to Course Details
              } else if (pct === 100) {
                buttonText = "Review";
              }

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img src={course.courseThumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-white mt-1">{pct}% complete</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{course.courseTitle}</h3>
                    <p className="text-sm text-slate-500">{completed}/{totalLectures} lectures • {calculateCourseDuration(course)}</p>
                    <button
                      onClick={() => navigate(destination)}
                      className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      {buttonText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-400 mb-4">You haven't enrolled in any courses yet.</p>
            <button onClick={() => navigate("/course-list")} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Browse Courses
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
        </div>
        <div className="p-6">
          {enrolledCourses?.length > 0 ? (
            <div className="space-y-4">
              {enrolledCourses.slice(0, 3).map((course, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">Enrolled in <span className="text-blue-600">{course.courseTitle}</span></p>
                    <p className="text-xs text-slate-500">{new Date(course.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
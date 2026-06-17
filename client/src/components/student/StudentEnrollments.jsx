import React, { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const StudentEnrollments = () => {
  const { enrolledCourses, calculateCourseDuration, userData, fetchUserEnrolledCourses } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) fetchUserEnrolledCourses();
  }, [userData]);

  const getProgressPct = (course) => {
    const total = course.courseContent?.reduce((acc, ch) => acc + (ch.chapterContent?.length || 0), 0) || 0;
    const completed = course.lectureCompleted?.length || 0;
    return total > 0 ? Math.round((completed * 100) / total) : 0;
  };

  return (
    <div className="h-full pb-20 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Enrollments</h1>
        <p className="text-slate-500 mt-1">All your active and completed courses.</p>
      </div>

      {enrolledCourses?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 mb-4">No enrollments yet.</p>
          <button onClick={() => navigate("/course-list")} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {enrolledCourses.map((course) => {
            const pct = getProgressPct(course);
            const totalLectures = course.courseContent?.reduce((acc, ch) => acc + (ch.chapterContent?.length || 0), 0) || 0;
            const completed = course.lectureCompleted?.length || 0;

            return (
              <div
                key={course._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-5 hover:shadow-md transition-shadow"
              >
                <img
                  src={course.courseThumbnail}
                  alt=""
                  className="w-24 h-24 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-800 truncate">{course.courseTitle}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      pct === 100 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {pct === 100 ? "Completed" : "In Progress"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{calculateCourseDuration(course)} • {completed}/{totalLectures} lectures</p>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden max-w-xs">
                    <div
                      className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/player/${course._id}`)}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shrink-0"
                >
                  {pct === 100 ? "Review" : pct === 0 ? "Start" : "Continue"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentEnrollments;
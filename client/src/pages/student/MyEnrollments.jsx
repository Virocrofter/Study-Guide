import React, { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import Footer from "../../components/student/Footer";

const MyEnrollments = () => {
  const {
    enrolledCourses,
    calculateCourseDuration,
    navigate,
    userData,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);

  const headerRef = useScrollReveal();

  useEffect(() => {
    if (userData) fetchUserEnrolledCourses();
  }, [userData]);

  const totalCourses = enrolledCourses?.length || 0;
  const completedCourses = enrolledCourses?.filter((c) => {
    const total = c.courseContent?.reduce(
      (acc, ch) => acc + (ch.chapterContent?.length || 0),
      0
    ) || 0;
    return total > 0 && (c.lectureCompleted?.length || 0) >= total;
  }).length || 0;
  const inProgress = totalCourses - completedCourses;

  if (!enrolledCourses) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header Section */}
      <div className="bg-slate-900 text-white pt-24 pb-32 px-6 md:px-40 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-slate-900 to-slate-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full" />

        <div ref={headerRef} className="reveal-up relative z-10 max-w-7xl mx-auto">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2">
            My Learning
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Enrollments</h1>
          <p className="text-slate-300 text-lg max-w-xl">
            Track your progress, pick up where you left off, and complete your learning journey.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <div className="bg-white/10 border border-white/10 rounded-xl px-6 py-4">
              <p className="text-3xl font-bold text-white">{totalCourses}</p>
              <p className="text-sm text-slate-400 mt-1">Total Courses</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl px-6 py-4">
              <p className="text-3xl font-bold text-emerald-400">{completedCourses}</p>
              <p className="text-sm text-slate-400 mt-1">Completed</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl px-6 py-4">
              <p className="text-3xl font-bold text-blue-400">{inProgress}</p>
              <p className="text-sm text-slate-400 mt-1">In Progress</p>
            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 75C120 70 240 60 360 55C480 50 600 50 720 52.5C840 55 960 60 1080 62.5C1200 65 1320 65 1380 65L1440 65V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </div>

      {/* Course Cards — flex-1 pushes footer down */}
      <div className="flex-1 max-w-7xl mx-auto px-6 md:px-40 w-full -mt-16 relative z-20 pb-20">
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No enrollments yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Explore our courses and start your learning journey today.
            </p>
            <button
              onClick={() => navigate("/course-list")}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course, index) => {
              const totalLectures =
                course.courseContent?.reduce(
                  (acc, chapter) => acc + (chapter.chapterContent?.length || 0),
                  0
                ) || 0;

              const completedLectures = course.lectureCompleted?.length || 0;
              const progressPct =
                totalLectures > 0
                  ? Math.round((completedLectures * 100) / totalLectures)
                  : 0;

              const isCompleted = progressPct === 100;

              return (
                <div
                  key={course._id || index}
                  className="reveal-up group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.courseThumbnail}
                      alt={course.courseTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                    
                    <div className="absolute top-4 right-4">
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-white/20"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className={isCompleted ? "text-emerald-400" : "text-blue-500"}
                            strokeDasharray={`${progressPct}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {progressPct}%
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isCompleted
                          ? "bg-emerald-500/90 text-white"
                          : "bg-blue-500/90 text-white"
                      }`}>
                        {isCompleted ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {course.courseTitle}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {calculateCourseDuration(course)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {totalLectures} Lectures
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">{completedLectures} of {totalLectures} completed</span>
                        <span className="font-semibold text-slate-700">{progressPct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isCompleted
                              ? "bg-linear-to-r from-emerald-400 to-emerald-500"
                              : "bg-linear-to-r from-blue-500 to-cyan-400"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/player/" + course._id)}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        isCompleted
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
                      }`}
                    >
                      {isCompleted ? "Review Course" : "Continue Learning"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
};

export default MyEnrollments;
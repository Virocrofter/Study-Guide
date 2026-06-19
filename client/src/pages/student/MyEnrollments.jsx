import React, { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/student/Footer";

const MyEnrollments = () => {
  const {
    enrolledCourses,
    calculateCourseDuration,
    userData,
    fetchUserEnrolledCourses,
  } = useContext(AppContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (userData) fetchUserEnrolledCourses();
  }, [userData]);

  // Calculate chapters finished for a course
  const getChaptersFinished = (course) => {
    const completedLectures = course.lectureCompleted || [];
    if (!course.courseContent || completedLectures.length === 0) return 0;

    return course.courseContent.filter((chapter) => {
      const chapterLectures = chapter.chapterContent || [];
      if (chapterLectures.length === 0) return false;
      return chapterLectures.every((lecture) =>
        completedLectures.includes(lecture.lectureId),
      );
    }).length;
  };

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
      {/* Header */}
      <div className="bg-slate-900 text-white pt-24 pb-32 px-6 md:px-40 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-slate-900 to-slate-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2">
            My Learning
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            My Enrollments
          </h1>
          <p className="text-slate-300 text-lg max-w-xl">
            Pick up where you left off and complete your learning journey.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 80L60 75C120 70 240 60 360 55C480 50 600 50 720 52.5C840 55 960 60 1080 62.5C1200 65 1320 65 1380 65L1440 65V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </div>

      {/* Course Cards */}
      <div className="flex-1 max-w-7xl mx-auto px-6 md:px-40 w-full -mt-16 relative z-20 pb-20">
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No enrollments yet
            </h3>
            <button
              onClick={() => navigate(`/student/player/${course._id}`)}
              className="bg-slate-900 text-white font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const totalLectures =
                course.courseContent?.reduce(
                  (acc, chapter) => acc + (chapter.chapterContent?.length || 0),
                  0,
                ) || 0;
              const completedLectures = course.lectureCompleted?.length || 0;
              const progressPct =
                totalLectures > 0
                  ? Math.round((completedLectures * 100) / totalLectures)
                  : 0;

              const totalChapters = course.courseContent?.length || 0;
              const chaptersFinished = getChaptersFinished(course);
              const hasStarted = completedLectures > 0;

              return (
                <div
                  key={course._id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative h-48 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/course/${course._id}`)}
                  >
                    <img
                      src={course.courseThumbnail}
                      alt={course.courseTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                    {/* Progress Ring */}
                    <div className="absolute top-4 right-4">
                      <div className="relative w-14 h-14">
                        <svg
                          className="w-full h-full -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          <path
                            className="text-white/20"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className={
                              progressPct === 100
                                ? "text-emerald-400"
                                : "text-blue-500"
                            }
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

                    {/* Status badge */}
                    <div className="absolute bottom-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          progressPct === 100
                            ? "bg-emerald-500/90 text-white"
                            : "bg-blue-500/90 text-white"
                        }`}
                      >
                        {progressPct === 100 ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3
                      className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 cursor-pointer group-hover:text-blue-600 transition-colors"
                      onClick={() => navigate(`/course/${course._id}`)}
                    >
                      {course.courseTitle}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {calculateCourseDuration(course)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        {totalChapters} Chapters
                      </span>
                    </div>

                    {/* Chapters finished */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-slate-600">
                        <span className="font-bold text-slate-800">
                          {chaptersFinished}
                        </span>{" "}
                        of {totalChapters} chapters finished
                      </span>
                      <span className="text-xs text-slate-400">
                        {completedLectures}/{totalLectures} lectures
                      </span>
                    </div>

                    {/* Linear progress bar */}
                    <div className="mb-5">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            progressPct === 100
                              ? "bg-linear-to-r from-emerald-400 to-emerald-500"
                              : "bg-linear-to-r from-blue-500 to-cyan-400"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => navigate(`/course/${course._id}`)}
                      className={`mt-auto w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        hasStarted
                          ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {hasStarted ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Continue Learning
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Start Course
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyEnrollments;

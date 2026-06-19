import React, { useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const StudentAnalytics = () => {
  const { enrolledCourses, backendUrl, currency } = useContext(AppContext);
  const [studyStats, setStudyStats] = useState({
    totalFlashcards: 0,
    mastery: 0,
    studyGuides: 0,
    practiceTests: 0,
  });
  const [flashcards, setFlashcards] = useState([]);
  const [guides, setGuides] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recents, setRecents] = useState([]);

  // ─── Follow Your Progress State ───
  const [weeklyTarget, setWeeklyTarget] = useState(7);
  const [activeDays, setActiveDays] = useState([
    true,
    true,
    true,
    false,
    false,
    false,
    false,
  ]);
  const [goal, setGoal] = useState("Change my career");
  const [editingGoal, setEditingGoal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempGoal, setTempGoal] = useState("");
  const [tempTarget, setTempTarget] = useState(7);

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const fullDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const activeCount = activeDays.filter(Boolean).length;

  const handleEditGoal = () => {
    setTempGoal(goal);
    setEditingGoal(true);
  };
  const handleSaveGoal = () => {
    if (tempGoal.trim()) setGoal(tempGoal.trim());
    setEditingGoal(false);
  };
  const handleCancelGoal = () => setEditingGoal(false);

  const handleEditTarget = () => {
    setTempTarget(weeklyTarget);
    setEditingTarget(true);
  };
  const handleSaveTarget = () => {
    if (tempTarget >= 1 && tempTarget <= 7) setWeeklyTarget(tempTarget);
    setEditingTarget(false);
  };
  const handleCancelTarget = () => setEditingTarget(false);

  const toggleDay = (index) => {
    const newDays = [...activeDays];
    newDays[index] = !newDays[index];
    setActiveDays(newDays);
  };

  const demoJumpBackIn = [
    {
      _id: "demo1",
      courseTitle: "Advanced JavaScript Patterns",
      courseThumbnail: assets.course_1_thumbnail,
      progress: 65,
      lastAccessed: "2 hours ago",
    },
    {
      _id: "demo2",
      courseTitle: "React Performance Masterclass",
      courseThumbnail: assets.course_2_thumbnail,
      progress: 42,
      lastAccessed: "Yesterday",
    },
    {
      _id: "demo3",
      courseTitle: "System Design Fundamentals",
      courseThumbnail: assets.course_3_thumbnail,
      progress: 28,
      lastAccessed: "3 days ago",
    },
  ];

  const demoRecents = [
    {
      type: "flashcard",
      title: "Reviewed 12 flashcards",
      time: "10 min ago",
      course: "JavaScript",
    },
    {
      type: "quiz",
      title: "Completed Quiz 3",
      time: "1 hour ago",
      course: "React Basics",
    },
    {
      type: "guide",
      title: "Created study guide",
      time: "3 hours ago",
      course: "Node.js",
    },
    {
      type: "test",
      title: "Practice test attempt",
      time: "Yesterday",
      course: "CSS Mastery",
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const tokenRes = await fetch(`${backendUrl}/api/auth/session`, {
          credentials: "include",
        });
        const tokenData = await tokenRes.json();
        const token = tokenData?.user?.id ? "authenticated" : "";

        if (!token) {
          setLoading(false);
          return;
        }

        const [fcRes, guideRes, testRes, statsRes] = await Promise.all([
          fetch(`${backendUrl}/api/user/flashcards`, {
            credentials: "include",
          }),
          fetch(`${backendUrl}/api/user/study-guides`, {
            credentials: "include",
          }),
          fetch(`${backendUrl}/api/user/practice-tests`, {
            credentials: "include",
          }),
          fetch(`${backendUrl}/api/study-sessions/stats`, {
            credentials: "include",
          }),
        ]);

        const [fcData, guideData, testData, statsData] = await Promise.all([
          fcRes.json(),
          guideRes.json(),
          testRes.json(),
          statsRes.json(),
        ]);

        if (fcData.success) setFlashcards(fcData.flashcards || []);
        if (guideData.success) setGuides(guideData.guides || []);
        if (testData.success) setTests(testData.tests || []);

        if (statsData.success) {
          setStudyStats({
            totalFlashcards: fcData.flashcards?.length || 0,
            mastery: Math.round(
              (fcData.flashcards?.reduce((s, c) => s + (c.mastery || 0), 0) ||
                0) / (fcData.flashcards?.length || 1),
            ),
            studyGuides: guideData.guides?.length || 0,
            practiceTests: testData.tests?.length || 0,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [backendUrl]);

  const getCourseProgress = (course) => {
    const total =
      course.courseContent?.reduce(
        (sum, ch) => sum + (ch.chapterContent?.length || 0),
        0,
      ) || 1;
    const completed = course.lectureCompleted?.length || 0;
    return Math.round((completed / total) * 100);
  };

  const getCourseThumbnail = (course) => {
    return course.courseThumbnail || assets.course_1_thumbnail;
  };

  const getRecentCourseTitle = (item) => {
    if (item.courseTitle) return item.courseTitle;
    if (item.courseId?.courseTitle) return item.courseId.courseTitle;
    return "Course";
  };

  const getRecentActivityIcon = (type) => {
    switch (type) {
      case "flashcard":
        return (
          <svg
            className="w-5 h-5 text-amber-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "quiz":
        return (
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "guide":
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "test":
        return (
          <svg
            className="w-5 h-5 text-emerald-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getRecentActivityText = (item) => {
    switch (item.type) {
      case "flashcard":
        return `Reviewed ${item.count || 12} flashcards`;
      case "quiz":
        return `Completed ${item.title || "Quiz"}`;
      case "guide":
        return `Created "${item.title || "Study Guide"}"`;
      case "test":
        return `Attempted "${item.title || "Practice Test"}"`;
      default:
        return item.title || "Activity";
    }
  };

  const getRecentTime = (item) => item.time || item.createdAt || "Recently";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4b3f8f]" />
      </div>
    );
  }

  const completedCourses =
    enrolledCourses?.filter((c) => getCourseProgress(c) === 100) || [];
  const inProgressCourses =
    enrolledCourses?.filter((c) => {
      const p = getCourseProgress(c);
      return p > 0 && p < 100;
    }) || [];
  const totalHours =
    enrolledCourses?.reduce((sum, c) => {
      const mins =
        c.courseContent?.reduce(
          (s, ch) =>
            s +
            (ch.chapterContent?.reduce(
              (ss, l) => ss + (l.lectureDuration || 0),
              0,
            ) || 0),
          0,
        ) || 0;
      return sum + mins / 60;
    }, 0) || 0;

  const jumpBackIn =
    enrolledCourses?.slice(0, 3).map((c) => ({
      ...c,
      progress: getCourseProgress(c),
      lastAccessed: "Recently",
    })) || [];

  const displayRecents = recents.length > 0 ? recents : demoRecents;
  const latestCourse = enrolledCourses?.[0];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* ─── Follow Your Progress Section ─── */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Follow your progress
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Card — Subjects & Motivation */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center min-h-[280px]">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 self-start w-full text-left">
              Subjects and languages
            </h3>
            <div className="w-full h-px bg-gray-100 mb-8 self-start" />
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Take action to stay motivated
              </p>
              <p className="text-gray-500 mb-6 max-w-md">
                Move forward in your learning and watch your skills grow.
              </p>
              {latestCourse ? (
                <Link
                  to={`/course/${latestCourse._id}`}
                  className="text-[#4b3f8f] font-semibold underline underline-offset-2 hover:text-[#3a3070] transition-colors"
                >
                  Continue in {latestCourse.courseTitle}
                </Link>
              ) : (
                <Link
                  to="/course-list"
                  className="text-[#4b3f8f] font-semibold underline underline-offset-2 hover:text-[#3a3070] transition-colors"
                >
                  Explore courses
                </Link>
              )}
            </div>
          </div>

          {/* Right Column — Weekly Target + Goal */}
          <div className="flex flex-col gap-5">
            {/* Weekly Target */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Weekly target
                </h3>
                {editingTarget ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSaveTarget}
                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelTarget}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditTarget}
                    className="flex items-center gap-1.5 text-[#4b3f8f] font-medium text-sm hover:text-[#3a3070] transition-colors"
                  >
                    Edit
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {editingTarget ? (
                <div className="mb-4">
                  <label className="text-sm text-gray-500 mb-1 block">
                    Target days per week
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={tempTarget}
                    onChange={(e) =>
                      setTempTarget(parseInt(e.target.value) || 1)
                    }
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#4b3f8f]/20"
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {activeCount}
                  </span>
                  <span className="text-gray-500 ml-1">
                    of {weeklyTarget} days
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => toggleDay(index)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all border-2 ${
                      activeDays[index]
                        ? "bg-[#4b3f8f] text-white border-[#4b3f8f]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                    title={fullDays[index]}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Your Goal */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Your goal
                </h3>
                {editingGoal ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSaveGoal}
                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelGoal}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditGoal}
                    className="flex items-center gap-1.5 text-[#4b3f8f] font-medium text-sm hover:text-[#3a3070] transition-colors"
                  >
                    Edit
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {editingGoal ? (
                <input
                  type="text"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveGoal()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4b3f8f]/20"
                  autoFocus
                />
              ) : (
                <p className="text-gray-700">{goal}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress Stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Course Progress
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {enrolledCourses?.length || 0}
              </span>
            </div>
            <p className="text-sm text-gray-500">Enrolled</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {completedCourses.length}
              </span>
            </div>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {inProgressCourses.length}
              </span>
            </div>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(totalHours)}h
              </span>
            </div>
            <p className="text-sm text-gray-500">Hours Learned</p>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Continue Learning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {enrolledCourses?.slice(0, 3).map((course) => {
            const progress = getCourseProgress(course);
            return (
              <div
                key={course._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={getCourseThumbnail(course)}
                    alt={course.courseTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {course.courseTitle}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {course.educator?.name || "Educator"}
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div
                      className="bg-[#4b3f8f] h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {progress}% complete
                    </span>
                    <Link
                      to={`/student/player/${course._id}`}
                      className="flex items-center gap-1 text-sm font-medium text-[#4b3f8f] hover:text-[#3a3070] transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {progress > 0 ? "Continue" : "Start"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          {(!enrolledCourses || enrolledCourses.length === 0) && (
            <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">No enrolled courses yet</p>
              <Link
                to="/course-list"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4b3f8f] text-white rounded-lg font-medium hover:bg-[#3a3070] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Explore Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Study Buddy Stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Study Buddy</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/student/flash-cards"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {studyStats.totalFlashcards}
              </span>
            </div>
            <p className="text-sm text-gray-500">Flashcards</p>
          </Link>
          <Link
            to="/student/flash-cards"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {studyStats.mastery}%
              </span>
            </div>
            <p className="text-sm text-gray-500">Mastery</p>
          </Link>
          <Link
            to="/student/study-guides"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {studyStats.studyGuides}
              </span>
            </div>
            <p className="text-sm text-gray-500">Study Guides</p>
          </Link>
          <Link
            to="/student/practice-tests"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {studyStats.practiceTests}
              </span>
            </div>
            <p className="text-sm text-gray-500">Practice Tests</p>
          </Link>
        </div>
      </div>

      {/* Jump Back In — Recently Done Flashcards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Jump back in</h2>
        {/* Removed bg-[#0f0f23] and adjusted padding */}
        <div className="py-2">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {flashcards
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.lastReviewed || b.createdAt) -
                  new Date(a.lastReviewed || a.createdAt),
              )
              .slice(0, 6)
              .map((card) => (
                <div
                  key={card._id}
                  className="min-w-[280px] md:min-w-[320px] bg-[#1a1a2e] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shrink-0"
                >
                  {/* Decorative shapes */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl" />
                  <div className="absolute top-4 right-4">
                    <button className="text-white/40 hover:text-white/70 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="6" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="18" cy="12" r="2" />
                      </svg>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1 pr-6 truncate">
                      {card.front?.length > 40
                        ? card.front.slice(0, 40) + "..."
                        : card.front || "Flashcard"}
                    </h3>
                    <p className="text-sm text-white/50 mb-4">
                      {card.reviewCount || 0}{" "}
                      {card.reviewCount === 1 ? "review" : "reviews"} completed
                    </p>
                  </div>

                  <div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 mb-3">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2.5 rounded-full transition-all"
                        style={{ width: `${card.mastery || 0}%` }}
                      />
                    </div>
                    <p className="text-sm text-white/60 mb-4">
                      {card.mastery || 0}% mastery
                    </p>
                    <Link
                      to="/student/flash-cards"
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              ))}

            {flashcards.length === 0 && (
              <div className="min-w-70 md:min-w-[320px] bg-[#1a1a2e] rounded-2xl p-5 flex flex-col items-center justify-center text-center shrink-0">
                <svg
                  className="w-10 h-10 text-white/20 mb-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <p className="text-white/50 text-sm mb-3">
                  No flashcards reviewed yet
                </p>
                <Link
                  to="/student/flash-cards"
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
                >
                  Create First Card
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recents */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Recents</h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {displayRecents.map((item, index) => (
            <div
              key={index}
              className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                {getRecentActivityIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {getRecentActivityText(item)}
                </p>
                <p className="text-sm text-gray-500">
                  {getRecentCourseTitle(item)} · {getRecentTime(item)}
                </p>
              </div>
            </div>
          ))}
          {displayRecents.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Recent Activity
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {enrolledCourses?.slice(0, 5).map((course) => (
            <div
              key={course._id}
              className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
            >
              <img
                src={getCourseThumbnail(course)}
                alt=""
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {course.courseTitle}
                </p>
                <p className="text-sm text-gray-500">Enrolled recently</p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  {getCourseProgress(course)}%
                </span>
              </div>
            </div>
          ))}
          {(!enrolledCourses || enrolledCourses.length === 0) && (
            <div className="text-center text-gray-500 py-8">
              No recent enrollments
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;

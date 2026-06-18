StudentAnalytics.jsx
import React, { useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  CheckCircle,
  Zap,
  FileText,
  Layers,
  Pencil,
  Check,
  X,
} from "lucide-react";

// ─── NEW: Follow Your Progress Section ───
const FollowYourProgress = ({ enrolledCourses }) => {
  const [weeklyTarget, setWeeklyTarget] = useState(7);
  const [activeDays, setActiveDays] = useState([true, true, true, false, false, false, false]);
  const [goal, setGoal] = useState("Change my career");
  const [editingGoal, setEditingGoal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempGoal, setTempGoal] = useState("");
  const [tempTarget, setTempTarget] = useState(7);

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
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

  const latestCourse = enrolledCourses?.[0];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-5">Follow your progress</h2>
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
              <h3 className="text-lg font-semibold text-gray-900">Weekly target</h3>
              {editingTarget ? (
                <div className="flex items-center gap-1">
                  <button onClick={handleSaveTarget} className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Check size={16} />
                  </button>
                  <button onClick={handleCancelTarget} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={handleEditTarget} className="flex items-center gap-1.5 text-[#4b3f8f] font-medium text-sm hover:text-[#3a3070] transition-colors">
                  Edit <Pencil size={14} />
                </button>
              )}
            </div>

            {editingTarget ? (
              <div className="mb-4">
                <label className="text-sm text-gray-500 mb-1 block">Target days per week</label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={tempTarget}
                  onChange={(e) => setTempTarget(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#4b3f8f]/20"
                />
              </div>
            ) : (
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">{activeCount}</span>
                <span className="text-gray-500 ml-1">of {weeklyTarget} days</span>
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
              <h3 className="text-lg font-semibold text-gray-900">Your goal</h3>
              {editingGoal ? (
                <div className="flex items-center gap-1">
                  <button onClick={handleSaveGoal} className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Check size={16} />
                  </button>
                  <button onClick={handleCancelGoal} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={handleEditGoal} className="flex items-center gap-1.5 text-[#4b3f8f] font-medium text-sm hover:text-[#3a3070] transition-colors">
                  Edit <Pencil size={14} />
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
  );
};

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
    { type: "flashcard", title: "Reviewed 12 flashcards", time: "10 min ago", course: "JavaScript" },
    { type: "quiz", title: "Completed Quiz 3", time: "1 hour ago", course: "React Basics" },
    { type: "guide", title: "Created study guide", time: "3 hours ago", course: "Node.js" },
    { type: "test", title: "Practice test attempt", time: "Yesterday", course: "CSS Mastery" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const tokenRes = await fetch(`${backendUrl}/api/auth/session`, { credentials: "include" });
        const tokenData = await tokenRes.json();
        const token = tokenData?.user?.id ? "authenticated" : "";

        if (!token) {
          setLoading(false);
          return;
        }

        const [fcRes, guideRes, testRes, statsRes] = await Promise.all([
          fetch(`${backendUrl}/api/user/flashcards`, { credentials: "include" }),
          fetch(`${backendUrl}/api/user/study-guides`, { credentials: "include" }),
          fetch(`${backendUrl}/api/user/practice-tests`, { credentials: "include" }),
          fetch(`${backendUrl}/api/study-sessions/stats`, { credentials: "include" }),
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
              (fcData.flashcards?.reduce((s, c) => s + (c.mastery || 0), 0) || 0) /
                (fcData.flashcards?.length || 1)
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
    const total = course.courseContent?.reduce((sum, ch) => sum + (ch.chapterContent?.length || 0), 0) || 1;
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
      case "flashcard": return <Zap size={16} className="text-amber-500" />;
      case "quiz": return <Award size={16} className="text-purple-500" />;
      case "guide": return <FileText size={16} className="text-blue-500" />;
      case "test": return <Layers size={16} className="text-emerald-500" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getRecentActivityText = (item) => {
    switch (item.type) {
      case "flashcard": return `Reviewed ${item.count || 12} flashcards`;
      case "quiz": return `Completed ${item.title || "Quiz"}`;
      case "guide": return `Created "${item.title || "Study Guide"}"`;
      case "test": return `Attempted "${item.title || "Practice Test"}"`;
      default: return item.title || "Activity";
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

  const completedCourses = enrolledCourses?.filter((c) => getCourseProgress(c) === 100) || [];
  const inProgressCourses = enrolledCourses?.filter((c) => {
    const p = getCourseProgress(c);
    return p > 0 && p < 100;
  }) || [];
  const totalHours = enrolledCourses?.reduce((sum, c) => {
    const mins = c.courseContent?.reduce((s, ch) => s + (ch.chapterContent?.reduce((ss, l) => ss + (l.lectureDuration || 0), 0) || 0), 0) || 0;
    return sum + mins / 60;
  }, 0) || 0;

  const jumpBackIn = enrolledCourses?.slice(0, 3).map((c) => ({
    ...c,
    progress: getCourseProgress(c),
    lastAccessed: "Recently",
  })) || [];

  const displayRecents = recents.length > 0 ? recents : demoRecents;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* ─── NEW: Follow Your Progress Section ─── */}
      <FollowYourProgress enrolledCourses={enrolledCourses} studyStats={studyStats} />

      {/* Course Progress Stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Course Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BookOpen size={20} className="text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{enrolledCourses?.length || 0}</span>
            </div>
            <p className="text-sm text-gray-500">Enrolled</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{completedCourses.length}</span>
            </div>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{inProgressCourses.length}</span>
            </div>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{Math.round(totalHours)}h</span>
            </div>
            <p className="text-sm text-gray-500">Hours Learned</p>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {enrolledCourses?.slice(0, 3).map((course) => {
            const progress = getCourseProgress(course);
            return (
              <div key={course._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 overflow-hidden">
                  <img src={getCourseThumbnail(course)} alt={course.courseTitle} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{course.courseTitle}</h3>
                  <p className="text-sm text-gray-500 mb-3">{course.educator?.name || "Educator"}</p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div className="bg-[#4b3f8f] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{progress}% complete</span>
                    <Link to={`/course/${course._id}`} className="flex items-center gap-1 text-sm font-medium text-[#4b3f8f] hover:text-[#3a3070] transition-colors">
                      <Play size={16} /> {progress > 0 ? "Continue" : "Start"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          {(!enrolledCourses || enrolledCourses.length === 0) && (
            <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">No enrolled courses yet</p>
              <Link to="/course-list" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4b3f8f] text-white rounded-lg font-medium hover:bg-[#3a3070] transition-colors">
                <BookOpen size={18} /> Explore Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Study Buddy Stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Study Buddy</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/student/flash-cards" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Zap size={20} className="text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{studyStats.totalFlashcards}</span>
            </div>
            <p className="text-sm text-gray-500">Flashcards</p>
          </Link>
          <Link to="/student/flash-cards" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <TrendingUp size={20} className="text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{studyStats.mastery}%</span>
            </div>
            <p className="text-sm text-gray-500">Mastery</p>
          </Link>
          <Link to="/student/study-guides" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FileText size={20} className="text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{studyStats.studyGuides}</span>
            </div>
            <p className="text-sm text-gray-500">Study Guides</p>
          </Link>
          <Link to="/student/practice-tests" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Layers size={20} className="text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{studyStats.practiceTests}</span>
            </div>
            <p className="text-sm text-gray-500">Practice Tests</p>
          </Link>
        </div>
      </div>

      {/* Jump Back In */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Jump back in</h2>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {(jumpBackIn.length > 0 ? jumpBackIn : demoJumpBackIn).map((course) => (
            <div key={course._id} className="min-w-[300px] bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 overflow-hidden relative">
                <img src={getCourseThumbnail(course)} alt={course.courseTitle} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-semibold text-white truncate">{course.courseTitle}</h3>
                  <p className="text-xs text-white/80">{course.lastAccessed}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{course.progress}%</span>
                  <Link to={`/course/${course._id}`} className="text-sm font-medium text-[#4b3f8f] hover:text-[#3a3070] transition-colors">
                    Resume
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recents */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Recents</h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {displayRecents.map((item, index) => (
            <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                {getRecentActivityIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{getRecentActivityText(item)}</p>
                <p className="text-sm text-gray-500">{getRecentCourseTitle(item)} · {getRecentTime(item)}</p>
              </div>
            </div>
          ))}
          {displayRecents.length === 0 && (
            <div className="p-8 text-center text-gray-500">No recent activity</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {enrolledCourses?.slice(0, 5).map((course) => (
            <div key={course._id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
              <img src={getCourseThumbnail(course)} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{course.courseTitle}</p>
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
            <div className="text-center text-gray-500 py-8">No recent enrollments</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Demo data so the UI is visible immediately
const demoJumpBackIn = [
  {
    id: "demo-1",
    title: "General trivia",
    type: "practice-test",
    progress: 50,
    total: 14,
    completed: 7,
    accent: "from-blue-500 to-indigo-500",
  },
  {
    id: "demo-2",
    title: "Biology: DNA",
    type: "flashcards",
    progress: 30,
    total: 20,
    completed: 6,
    accent: "from-emerald-400 to-teal-500",
  },
];

const demoRecents = [
  {
    id: "demo-r1",
    title: "General trivia",
    meta: "7 cards • by Quizlet",
    icon: "flashcard",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "demo-r2",
    title: "Nothing Phone (2a) 12GB/256GB Specs & Features",
    meta: "18 cards • by you",
    icon: "flashcard",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "demo-r3",
    title: "Biology: Cell Structure",
    meta: "Study guide • by you",
    icon: "guide",
    color: "bg-violet-500/20 text-violet-400",
  },
  {
    id: "demo-r4",
    title: "pokemon",
    meta: "2 cards • by you",
    icon: "flashcard",
    color: "bg-blue-500/20 text-blue-400",
  },
];

const StudentAnalytics = () => {
  const { enrolledCourses, calculateCourseDuration, userData, fetchUserEnrolledCourses, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState([]);
  const [studyStats, setStudyStats] = useState({
    flashcards: 0, dueCards: 0, avgMastery: 0, guides: 0, tests: 0,
    testAttempts: 0, avgTestScore: 0, libraryItems: 0,
  });
  const [jumpBackIn, setJumpBackIn] = useState(demoJumpBackIn);
  const [recents, setRecents] = useState(demoRecents);

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

  useEffect(() => {
    const fetchStudyStats = async () => {
      try {
        const [cardsRes, guidesRes, testsRes, libRes] = await Promise.all([
          axios.get(`${backendUrl}/api/user/flashcards`, { withCredentials: true }).catch(() => ({ data: { flashcards: [] } })),
          axios.get(`${backendUrl}/api/user/study-guides`, { withCredentials: true }).catch(() => ({ data: { guides: [] } })),
          axios.get(`${backendUrl}/api/user/practice-tests`, { withCredentials: true }).catch(() => ({ data: { tests: [] } })),
          axios.get(`${backendUrl}/api/user/library`, { withCredentials: true }).catch(() => ({ data: { items: [] } })),
        ]);

        const flashcards = cardsRes.data.flashcards || [];
        const guides = guidesRes.data.guides || [];
        const tests = testsRes.data.tests || [];
        const libraryItems = libRes.data.items || [];

        const dueCards = flashcards.filter((c) => !c.nextReview || new Date(c.nextReview) <= new Date());
        const avgMastery = flashcards.length > 0
          ? Math.round(flashcards.reduce((acc, c) => acc + (c.mastery || 0), 0) / flashcards.length)
          : 0;

        const totalAttempts = tests.reduce((acc, t) => acc + (t.attempts?.length || 0), 0);
        const avgTestScore = tests.length > 0
          ? Math.round(
              tests.reduce((acc, t) => {
                const last = t.attempts?.[t.attempts.length - 1];
                return acc + (last?.percentage || 0);
              }, 0) / tests.length
            )
          : 0;

        setStudyStats({
          flashcards: flashcards.length,
          dueCards: dueCards.length,
          avgMastery,
          guides: guides.length,
          tests: tests.length,
          testAttempts: totalAttempts,
          avgTestScore,
          libraryItems: libraryItems.length,
        });

        // Merge real data into Jump back in
        const jumpItems = [];
        if (tests.length > 0) {
          const lastTest = tests[0];
          const lastAttempt = lastTest.attempts?.[lastTest.attempts.length - 1];
          const pct = lastAttempt ? lastAttempt.percentage : 0;
          jumpItems.push({
            id: lastTest._id,
            title: lastTest.title,
            type: "practice-test",
            progress: pct,
            total: lastTest.questions?.length || 0,
            completed: lastAttempt ? Math.round((pct / 100) * (lastTest.questions?.length || 1)) : 0,
            accent: "from-blue-500 to-indigo-500",
          });
        }
        if (flashcards.length > 0) {
          const mastery = flashcards.length > 0
            ? Math.round(flashcards.reduce((a, c) => a + (c.mastery || 0), 0) / flashcards.length)
            : 0;
          jumpItems.push({
            id: "flashcards",
            title: "Flashcards Review",
            type: "flashcards",
            progress: mastery,
            total: flashcards.length,
            completed: flashcards.length - dueCards.length,
            accent: "from-emerald-400 to-teal-500",
          });
        }
        if (guides.length > 0) {
          jumpItems.push({
            id: guides[0]._id,
            title: guides[0].title,
            type: "study-guide",
            progress: 30,
            total: guides[0].sections?.length || 0,
            completed: 1,
            accent: "from-violet-500 to-purple-500",
          });
        }
        if (jumpItems.length > 0) setJumpBackIn(jumpItems);

        // Merge real data into Recents
        const recentItems = [];
        if (flashcards.length > 0) {
          recentItems.push({
            id: "fc-recent",
            title: "Flashcards Review",
            meta: `${flashcards.length} cards • by you`,
            icon: "flashcard",
            color: "bg-blue-500/20 text-blue-400",
          });
        }
        if (guides.length > 0) {
          recentItems.push({
            id: guides[0]._id,
            title: guides[0].title,
            meta: `Study guide • by you`,
            icon: "guide",
            color: "bg-violet-500/20 text-violet-400",
          });
        }
        if (tests.length > 0) {
          recentItems.push({
            id: tests[0]._id,
            title: tests[0].title,
            meta: `${tests[0].questions?.length || 0} questions • by you`,
            icon: "test",
            color: "bg-emerald-500/20 text-emerald-400",
          });
        }
        if (libraryItems.length > 0) {
          recentItems.push({
            id: libraryItems[0]._id,
            title: libraryItems[0].title,
            meta: `${libraryItems[0].type} • saved`,
            icon: "library",
            color: "bg-amber-500/20 text-amber-400",
          });
        }
        if (recentItems.length > 0) setRecents(recentItems);

      } catch (e) {
        console.error("Study stats error:", e);
      }
    };
    if (userData) fetchStudyStats();
  }, [userData, backendUrl]);

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

  const courseStats = [
    {
      label: "Courses Enrolled", value: totalCourses,
      icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
      bg: "bg-blue-50", text: "text-blue-700",
    },
    {
      label: "Completed", value: completedCourses,
      icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      bg: "bg-emerald-50", text: "text-emerald-700",
    },
    {
      label: "In Progress", value: inProgress,
      icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      bg: "bg-amber-50", text: "text-amber-700",
    },
    {
      label: "Hours Learned", value: Math.round(totalHours / 60),
      icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      bg: "bg-violet-50", text: "text-violet-700",
    },
  ];

  const studyBuddyStats = [
    {
      label: "Flashcards", value: studyStats.flashcards, sub: `${studyStats.dueCards} due`,
      icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>),
      bg: "bg-emerald-50", text: "text-emerald-700", route: "/student/flash-cards",
    },
    {
      label: "Mastery", value: `${studyStats.avgMastery}%`, sub: "avg proficiency",
      icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      bg: "bg-teal-50", text: "text-teal-700", route: "/student/flash-cards",
    },
    {
      label: "Study Guides", value: studyStats.guides, sub: "created",
      icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
      bg: "bg-cyan-50", text: "text-cyan-700", route: "/student/study-guides",
    },
    {
      label: "Practice Tests", value: studyStats.tests, sub: `${studyStats.testAttempts} attempts`,
      icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>),
      bg: "bg-lime-50", text: "text-lime-700", route: "/student/practice-tests",
    },
  ];

  const getIcon = (type) => {
    if (type === "flashcard") return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
    );
    if (type === "guide") return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    );
    if (type === "test") return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    );
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    );
  };

  const handleContinue = (item) => {
    if (item.type === "practice-test") navigate("/student/practice-tests");
    else if (item.type === "flashcards") navigate("/student/flash-cards");
    else if (item.type === "study-guide") navigate("/student/study-guides");
  };

  return (
    <div className="h-full pb-20 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Track your learning progress and study habits.</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Course Progress
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {courseStats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.text} mb-4`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Study Buddy
        </h2>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {studyBuddyStats.map((stat, i) => (
            <div
              key={i}
              onClick={() => navigate(stat.route)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.text} mb-4 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            JUMP BACK IN — always renders
            ═══════════════════════════════════════════ */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Jump back in</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {jumpBackIn.map((item) => (
              <div
                key={item.id}
                className="min-w-[320px] max-w-[320px] bg-slate-900 rounded-3xl p-6 relative overflow-hidden snap-start cursor-pointer group hover:shadow-xl transition-shadow"
                onClick={() => handleContinue(item)}
              >
                <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${item.accent} opacity-20 blur-2xl`} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <h4 className="text-xl font-bold text-white">{item.title}</h4>
                    <button className="text-slate-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                    </button>
                  </div>

                  <div className="mb-2">
                    <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.accent}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-6">
                    {item.progress}% of questions completed
                  </p>

                  <button className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-500 transition-colors">
                    Continue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            RECENTS — always renders
            ═══════════════════════════════════════════ */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Recents</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {recents.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(
                  item.icon === "flashcard" ? "/student/flash-cards" :
                  item.icon === "guide" ? "/student/study-guides" :
                  item.icon === "test" ? "/student/practice-tests" : "/student/library"
                )}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                  {getIcon(item.icon)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              let buttonText = "Continue";
              let destination = `/player/${course._id}`;
              if (pct === 0) { buttonText = "Start Course"; destination = `/course/${course._id}`; }
              else if (pct === 100) { buttonText = "Review"; }

              return (
                <div key={course._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group">
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
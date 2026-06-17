import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import Footer from "../../components/student/Footer";
import Youtube from "react-youtube";
import axios from "axios";
import { toast } from "react-toastify";
import Rating from "../../components/student/Rating";

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeLecture, setActiveLecture] = useState(0);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showQuiz, setShowQuiz] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMaterials, setShowMaterials] = useState(true);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [materials, setMaterials] = useState([]);
  const [lectureMaterials, setLectureMaterials] = useState({});

  // Quiz state — NEW
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const {
    calculateRating,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    currency,
    backendUrl,
    userData,
    session,
    signInWithGoogle,
  } = useContext(AppContext);

  const isEnrolled = userData?.enrolledCourses?.some(
    (cId) => cId.toString() === id,
  );

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
      if (data.success) {
        setCourseData(data.course);
        if (data.course?.courseContent?.[0]?.chapterContent?.[0]) {
          const firstLecture = data.course.courseContent[0].chapterContent[0];
          const videoId = getYouTubeId(firstLecture.lectureUrl);
          setPlayerData({ ...firstLecture, chapter: 1, lecture: 1, videoId });
        }
      } else {
        toast.error(data.message || "Course not found");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!isEnrolled || !id) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/messages/${id}`,
        { withCredentials: true },
      );
      if (data.success) setChatMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterials = async () => {
    if (!isEnrolled || !id) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/materials/${id}`,
        { withCredentials: true },
      );
      if (data.success) {
        const grouped = {};
        data.materials.forEach((m) => {
          if (!grouped[m.lectureId]) grouped[m.lectureId] = [];
          grouped[m.lectureId].push(m);
        });
        setLectureMaterials(grouped);
        setMaterials(data.materials);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch quizzes — NEW
  const fetchQuizzes = async () => {
    if (!isEnrolled || !id) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/quizzes/${id}`,
        { withCredentials: true },
      );
      if (data.success) setQuizzes(data.quizzes);
    } catch (err) {
      console.error(err);
    }
  };

  const enrollCourse = async () => {
    try {
      if (!session?.user) return toast.warn("Please sign in first");
      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { courseId: courseData._id },
        { withCredentials: true },
      );
      if (data.success) window.location.replace(data.session_url);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleLectureClick = (chapterIndex, lectureIndex, lecture) => {
    const videoId = getYouTubeId(lecture.lectureUrl);
    if (videoId) {
      setActiveChapter(chapterIndex);
      setActiveLecture(lectureIndex);
      setPlayerData({
        ...lecture,
        chapter: chapterIndex + 1,
        lecture: lectureIndex + 1,
        videoId,
      });
    } else {
      toast.error("Could not load video. Please check the URL.");
    }
  };

  const handleRate = async (rating) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseId: id, rating },
        { withCredentials: true },
      );
      if (data.success) {
        toast.success(data.message);
        fetchCourseData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !isEnrolled) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/messages/${id}`,
        {
          text: chatInput,
          userName: userData?.name || "Student",
          userImage: userData?.imageUrl || "",
        },
        { withCredentials: true },
      );
      if (data.success) {
        setChatMessages([...chatMessages, data.data]);
        setChatInput("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const toggleQuiz = () => {
    if (!showQuiz) {
      setShowQuiz(true);
      setShowChat(false);
    } else {
      setShowQuiz(false);
      setActiveQuiz(null);
      setQuizResult(null);
    }
  };

  const toggleChat = () => {
    if (!showChat) {
      setShowChat(true);
      setShowQuiz(false);
    } else {
      setShowChat(false);
    }
  };

  const toggleMaterials = () => {
    setShowMaterials(!showMaterials);
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (isEnrolled) {
      fetchMessages();
      fetchMaterials();
      fetchQuizzes(); // NEW
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isEnrolled, id]);

  if (loading) return <Loading />;
  if (!courseData)
    return (
      <div className="text-center pt-40 text-slate-500">Course not found.</div>
    );

  const finalPrice = (
    courseData.coursePrice -
    (courseData.discount * courseData.coursePrice) / 100
  ).toFixed(2);
  const rating = calculateRating(courseData);

  const leftPanelOpen = showQuiz || showChat;
  const rightPanelOpen = showMaterials;

  return (
    <div className="min-h-screen bg-[#f0eef4] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{courseData.courseTitle}</h1>
            <p className="text-sm text-slate-500">{courseData.educator?.name || "Educator"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!session?.user ? (
            <button onClick={signInWithGoogle} className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
              Sign in to Enroll
            </button>
          ) : isEnrolled ? (
            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Enrolled
            </span>
          ) : (
            <button onClick={enrollCourse} className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
              Enroll Now — {currency}{finalPrice}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-10 md:px-14 lg:px-36 mx-auto flex-1 w-full">
        {/* LEFT SIDEBAR - Chapters */}
        <div className="w-full lg:w-80 shrink-0 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800">Chapters</h2>
            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
              {calculateNoOfLectures(courseData)} Lectures
            </span>
          </div>

          {courseData.courseContent?.map((chapter, chIndex) => {
            const isActive = activeChapter === chIndex;
            const lectureCount = chapter.chapterContent?.length || 0;
            const chapterDuration = calculateChapterTime(chapter);
            return (
              <div
                key={chIndex}
                onClick={() => {
                  if (chapter.chapterContent?.[0]) {
                    handleLectureClick(chIndex, 0, chapter.chapterContent[0]);
                  }
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                  isActive ? "bg-[#c8c4d4] border-[#a69eb8] shadow-md" : "bg-[#d9d5e2] border-transparent hover:bg-[#cec9d8]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${isActive ? "text-slate-900" : "text-slate-700"}`}>{chapter.chapterTitle}</h3>
                  {isActive && <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    {lectureCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {chapterDuration}
                  </span>
                </div>
                {isActive && (
                  <div className="mt-3 space-y-2">
                    {chapter.chapterContent?.map((lecture, lIndex) => {
                      const isLectureActive = activeLecture === lIndex;
                      return (
                        <div
                          key={lIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLectureClick(chIndex, lIndex, lecture);
                          }}
                          className={`flex items-center gap-3 p-2 rounded-xl text-sm transition-colors ${
                            isLectureActive ? "bg-white/60 text-slate-900" : "text-slate-600 hover:bg-white/40"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isLectureActive ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"
                          }`}>
                            {isLectureActive ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> : lIndex + 1}
                          </div>
                          <span className="flex-1 truncate">{lecture.lectureTitle}</span>
                          <span className="text-xs text-slate-500">{lecture.lectureDuration}m</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Sidebar Tool Icons */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={toggleMaterials}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                showMaterials ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
              title="Materials"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </button>
            <button
              onClick={toggleChat}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                showChat ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
              title="Course Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
            <button
              onClick={toggleQuiz}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                showQuiz ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
              title="Quiz"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </button>
          </div>
        </div>

        {/* RIGHT AREA - Video + Bottom Panels */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Video Player */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200">
            <div className="relative aspect-video bg-black">
              {playerData?.videoId ? (
                <Youtube
                  videoId={playerData.videoId}
                  opts={{ playerVars: { autoplay: 0, rel: 0 }, width: "100%", height: "100%" }}
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <img src={courseData.courseThumbnail} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Chapter {playerData?.chapter} • Lecture {playerData?.lecture}</p>
                <h3 className="text-lg font-bold text-slate-800">{playerData?.lectureTitle || courseData.courseTitle}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {calculateCourseDuration(courseData)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Panels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT SLOT: Quiz OR Chat (2/3 width) */}
            {showQuiz && (
              <div className="md:col-span-2 bg-[#c8c4d4] rounded-3xl p-6 h-[400px] flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-xl font-bold text-slate-800">
                    {activeQuiz ? activeQuiz.title : "Quizzes"}
                  </h3>
                  <button
                    onClick={() => { setShowQuiz(false); setActiveQuiz(null); setQuizResult(null); }}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {!isEnrolled ? (
                    <p className="text-sm text-slate-500 text-center py-8">Enroll to take quizzes</p>
                  ) : activeQuiz ? (
                    quizResult ? (
                      <div className="space-y-4">
                        <div className="bg-white/80 rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-slate-800">{quizResult.percentage}%</p>
                          <p className="text-sm text-slate-600">{quizResult.score} / {quizResult.totalQuestions} correct</p>
                          <p className={`text-sm font-bold mt-2 ${quizResult.passed ? "text-emerald-600" : "text-amber-600"}`}>
                            {quizResult.passed ? "Passed!" : "Keep learning!"}
                          </p>
                        </div>
                        {activeQuiz.questions.map((q, idx) => (
                          <div key={idx} className="bg-white/60 rounded-xl p-3">
                            <p className="text-sm font-medium text-slate-800 mb-2">{idx + 1}. {q.questionText}</p>
                            <div className="space-y-1">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className={`text-sm px-3 py-2 rounded-lg ${
                                  optIdx === q.correctAnswer ? "bg-emerald-100 text-emerald-700" :
                                  quizResult.answers[idx] === optIdx ? "bg-red-100 text-red-700" :
                                  "bg-white/40 text-slate-600"
                                }`}>
                                  {optIdx === q.correctAnswer ? "✓ " : quizResult.answers[idx] === optIdx ? "✗ " : ""}
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => { setActiveQuiz(null); setQuizResult(null); setQuizAnswers({}); }}
                          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          Back to Quizzes
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeQuiz.questions.map((q, idx) => (
                          <div key={idx} className="bg-white/60 rounded-xl p-3">
                            <p className="text-sm font-medium text-slate-800 mb-2">{idx + 1}. {q.questionText}</p>
                            <div className="space-y-1">
                              {q.options.map((opt, optIdx) => (
                                <button
                                  key={optIdx}
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: optIdx })}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                    quizAnswers[idx] === optIdx ? "bg-blue-600 text-white" : "bg-white/40 text-slate-700 hover:bg-white"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}. {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={async () => {
                            if (Object.keys(quizAnswers).length !== activeQuiz.questions.length) {
                              toast.warn("Answer all questions");
                              return;
                            }
                            setQuizLoading(true);
                            try {
                              const answers = activeQuiz.questions.map((_, idx) => quizAnswers[idx]);
                              const { data } = await axios.post(
                                `${backendUrl}/api/user/quizzes/${activeQuiz._id}/submit`,
                                { answers },
                                { withCredentials: true }
                              );
                              if (data.success) {
                                setQuizResult(data.submission);
                                fetchQuizzes();
                              } else {
                                toast.error(data.message);
                              }
                            } catch (err) {
                              toast.error(err.response?.data?.message || err.message);
                            } finally {
                              setQuizLoading(false);
                            }
                          }}
                          disabled={quizLoading}
                          className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          {quizLoading ? "Submitting..." : "Submit Quiz"}
                        </button>
                      </div>
                    )
                  ) : quizzes.length > 0 ? (
                    quizzes.map((quiz) => (
                      <div key={quiz._id} className="bg-white/60 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{quiz.title}</p>
                          <p className="text-xs text-slate-500">{quiz.questions.length} questions</p>
                          {quiz.submitted && (
                            <p className={`text-xs font-bold ${quiz.percentage >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                              Score: {quiz.percentage}%
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (quiz.submitted) { toast.info("You already completed this quiz"); return; }
                            setActiveQuiz(quiz);
                            setQuizAnswers({});
                            setQuizResult(null);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                            quiz.submitted ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {quiz.submitted ? "Completed" : "Start"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-8">No quizzes available for this course yet.</p>
                  )}
                </div>
              </div>
            )}

            {showChat && (
              <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-100 flex flex-col">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-xl font-bold text-slate-800">Course Chat</h3>
                  <button onClick={() => setShowChat(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                  {chatMessages.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No messages yet. Start the conversation!</p>}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.userId === userData?._id ? "flex-row-reverse" : ""}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        msg.userId === userData?._id ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {msg.userName?.charAt(0) || "?"}
                      </div>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        msg.userId === userData?._id ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-100 text-slate-700 rounded-bl-none"
                      }`}>
                        <p className="font-semibold text-[10px] mb-0.5 opacity-80">{msg.userName || "Unknown"}</p>
                        <p>{msg.text}</p>
                        <p className="text-[10px] mt-1 opacity-50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="shrink-0 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChat()}
                    placeholder={isEnrolled ? "Type Message" : "Enroll to chat"}
                    disabled={!isEnrolled}
                    className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button onClick={sendChat} disabled={!isEnrolled} className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors disabled:opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* RIGHT SLOT: Materials (1/3 width) */}
            {showMaterials && (
              <div className={`bg-[#c8c4d4] rounded-3xl p-6 h-100 flex flex-col shadow-sm ${!leftPanelOpen ? "md:col-start-3" : ""}`}>
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{courseData.courseContent?.[activeChapter]?.chapterTitle || "Materials"}</h3>
                    <p className="text-sm text-slate-500">{playerData?.lectureTitle || `Lecture ${activeLecture + 1}`}</p>
                  </div>
                  <button onClick={() => setShowMaterials(false)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {(lectureMaterials[playerData?.lectureId] || []).length > 0 ? (
                    lectureMaterials[playerData?.lectureId].map((material, idx) => (
                      <a key={idx} href={material.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/80 hover:bg-white text-sm transition-colors shadow-sm">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          material.type === "video" ? "bg-red-500 text-white" :
                          material.type === "audio" ? "bg-green-500 text-white" :
                          "bg-blue-600 text-white"
                        }`}>
                          {material.type === "video" ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> :
                           material.type === "audio" ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg> :
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{material.title}</p>
                          <p className="text-xs text-slate-500">{material.fileName || material.duration || "Download"}</p>
                        </div>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-500">No materials for this lecture.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rating Section */}
          <div className="bg-white rounded-3xl p-8 pb-8 border border-slate-200 shadow-sm mb-6">
            <div className="flex items-center gap-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Rate this Course</h3>
                <p className="text-sm text-slate-500">Your feedback helps other learners</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-800">{rating}</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-300 fill-slate-300"}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{courseData.courseRatings?.length || 0} ratings</p>
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <Rating initialRating={0} onRate={handleRate} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetails;
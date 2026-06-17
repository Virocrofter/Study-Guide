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
  const [chatMessages, setChatMessages] = useState([
    { user: "System", text: "Welcome to the course chat! Ask questions here.", time: "10:25" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [materialsTab, setMaterialsTab] = useState("videos");

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

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
      if (data.success) {
        setCourseData(data.course);
        // Auto-select first lecture
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

  const enrollCourse = async () => {
    try {
      if (!session?.user) return toast.warn("Please sign in first");
      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { courseId: courseData._id },
        { withCredentials: true }
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
      setPlayerData({ ...lecture, chapter: chapterIndex + 1, lecture: lectureIndex + 1, videoId });
    } else {
      toast.error("Could not load video. Please check the URL.");
    }
  };

  const handleRate = async (rating) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseId: id, rating },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        fetchCourseData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { user: "You", text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput("");
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  if (loading) return <Loading />;
  if (!courseData) return <div className="text-center pt-40 text-slate-500">Course not found.</div>;

  const isEnrolled = userData?.enrolledCourses?.some((cId) => cId.toString() === id);
  const finalPrice = (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2);
  const rating = calculateRating(courseData);

  return (
    <div className="min-h-screen bg-[#f0eef4]">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{courseData.courseTitle}</h1>
            <p className="text-sm text-slate-500">Grade 10 • {courseData.educator?.name || "Educator"}</p>
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

      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-400 mx-auto">
        {/* LEFT SIDEBAR - Chapters */}
        <div className="w-full lg:w-80 shrink-0 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800">Chapters</h2>
            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{calculateNoOfLectures(courseData)} Lectures</span>
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
                  isActive
                    ? "bg-[#c8c4d4] border-[#a69eb8] shadow-md"
                    : "bg-[#d9d5e2] border-transparent hover:bg-[#cec9d8]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                    {chapter.chapterTitle}
                  </h3>
                  {isActive && (
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {lectureCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {chapterDuration}
                  </span>
                </div>

                {/* Lecture list inside chapter */}
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
                            {isLectureActive ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            ) : (
                              lIndex + 1
                            )}
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

          {/* Sidebar Tools */}
          <div className="flex items-center gap-3 mt-6">
            <button onClick={() => setShowQuiz(!showQuiz)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${showQuiz ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </button>
            <button onClick={() => setShowChat(!showChat)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${showChat ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
            <button className="w-12 h-12 rounded-full bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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
                  opts={{
                    playerVars: { autoplay: 0, rel: 0 },
                    width: "100%",
                    height: "100%",
                  }}
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <img src={courseData.courseThumbnail} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  Chapter {playerData?.chapter} • Lecture {playerData?.lecture}
                </p>
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
          <div className="grid md:grid-cols-3 gap-6">
            {/* Quiz Panel */}
            <div className="bg-[#c8c4d4] rounded-3xl p-6 relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Quiz</h3>
                <button onClick={() => setShowQuiz(false)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-sm font-bold text-slate-500 mt-1">01</span>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    What is the main topic of this lecture? Select the correct definition from the options below.
                  </p>
                </div>
                {["A", "B", "C", "D"].map((opt) => (
                  <button
                    key={opt}
                    className="w-full text-left p-3 rounded-xl bg-white/60 hover:bg-white text-sm text-slate-700 transition-colors flex items-start gap-3"
                  >
                    <span className="font-bold text-slate-500 shrink-0">{opt}</span>
                    <span>It is the study of the core concepts covered in this chapter.</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Course Chat Panel */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Course Chat</h3>
                <button onClick={() => setShowChat(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.user === "You" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.user === "You" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                      {msg.user === "You" ? "Y" : msg.user.charAt(0)}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.user === "You" ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-100 text-slate-700 rounded-bl-none"}`}>
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.user === "You" ? "text-blue-200" : "text-slate-400"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Type Message"
                  className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={sendChat} className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2 rounded-full border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  files
                </button>
                <button className="flex-1 py-2 rounded-full border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Image
                </button>
                <button className="flex-1 py-2 rounded-full border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  Audio
                </button>
              </div>
            </div>

            {/* Materials Panel */}
            <div className="bg-[#c8c4d4] rounded-3xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                {courseData.courseContent?.[activeChapter]?.chapterTitle || "Materials"}
              </h3>
              <p className="text-sm text-slate-500 mb-4">Lecture {activeLecture + 1}</p>

              <div className="flex gap-2 mb-4">
                {["files", "videos", "Audio"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMaterialsTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      materialsTab === tab
                        ? "bg-slate-900 text-white"
                        : "bg-white/60 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {courseData.courseContent?.[activeChapter]?.chapterContent?.map((lecture, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleLectureClick(activeChapter, idx, lecture)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      activeLecture === idx ? "bg-white shadow-sm" : "bg-white/40 hover:bg-white/60"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      activeLecture === idx ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"
                    }`}>
                      {activeLecture === idx ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{lecture.lectureTitle}</p>
                      <p className="text-xs text-slate-500">{lecture.lectureDuration} mins</p>
                    </div>
                    {activeLecture === idx && (
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rating Section - Preserved */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
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
                <Rating onRate={handleRate} />
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
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import Footer from "../../components/student/Footer";
import axios from "axios";
import { toast } from "react-toastify";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [openChapters, setOpenChapters] = useState({});

  const {
    calculateRating,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    currency,
    backendUrl,
    userData,
    session
  } = useContext(AppContext);

  // Check enrollment condition exactly as done in original code
  const isEnrolled = userData?.enrolledCourses?.some(
    (cId) => cId.toString() === id
  );

  useEffect(() => {
    const fetchCoursePreview = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
        if (data.success) {
          setCourseData(data.course);
          // Auto-expand the first chapter accordion by default
          setOpenChapters({ 0: true });
        } else {
          toast.error(data.message || "Course details could not be found.");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCoursePreview();
  }, [id, backendUrl]);

  if (loading) return <Loading />;
  if (!courseData) return <div className="p-20 text-center text-gray-500">Course view not available.</div>;

  const rating = calculateRating(courseData);
  const rawPrice = courseData.coursePrice || 49.99;
  const discount = courseData.discount || 0;
  const monthlyPrice = (rawPrice - (discount * rawPrice) / 100).toFixed(2);
  const yearlyPrice = ((rawPrice * 12 - (discount * rawPrice * 12) / 100) * 0.8).toFixed(2);

  const toggleChapter = (index) => {
    setOpenChapters((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handlePayment = async () => {
    try {
      if (!session?.user) return toast.warn("Please log in to finalize your course subscription.");
      
      // If already purchased, route directly to the playback studio panel
      if (isEnrolled) {
        navigate(`/student/player/${courseData._id}`);
        return;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { courseId: courseData._id, plan: billingCycle },
        { withCredentials: true }
      );
      if (data.success && data.session_url) {
        window.location.replace(data.session_url);
      } else {
        toast.error(data.message || "Stripe gateway creation failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-left">
      {/* Hero Banner Grid Layout */}
      <div className="bg-slate-900 text-white pt-24 pb-16 px-6 md:px-16 lg:px-36 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto relative z-10">
          {/* Main Context Left Side */}
          <div className="lg:col-span-7 space-y-5">
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold uppercase px-3 py-1 rounded-full tracking-wider">
              Premium Track
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
              {courseData.courseTitle}
            </h1>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl font-light leading-relaxed">
              {courseData.courseDescription?.replace(/<[^>]*>/g, "").slice(0, 220)}...
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400 font-bold">★ {rating}</span>
                <span className="text-slate-400">({courseData.courseRatings?.length || 0} evaluations)</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <div>📁 {courseData.courseContent?.length || 0} Modules</div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <div>⏱ {calculateCourseDuration(courseData)} Total Track Hours</div>
            </div>

            {/* Author Attribution Card */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800 max-w-md">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
                {courseData.educator?.name?.charAt(0) || "E"}
              </div>
              <div>
                <p className="text-xs text-slate-400">Curated & Managed By</p>
                <h4 className="text-sm font-semibold text-white">{courseData.educator?.name || "Senior Subject Expert"}</h4>
              </div>
            </div>
          </div>

          {/* Checkout Strategy Purchase Panel Right Side */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6 md:p-8 text-slate-800 overflow-hidden relative">
              <div className="aspect-video rounded-2xl overflow-hidden mb-6 shadow-md border border-slate-100">
                <img 
                  className="w-full h-full object-cover" 
                  src={courseData.courseThumbnail} 
                  alt={courseData.courseTitle} 
                />
              </div>

              {/* Only show switches if not purchased yet */}
              {!isEnrolled ? (
                <>
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-6">
                    <button
                      onClick={() => setBillingCycle("monthly")}
                      className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${billingCycle === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Monthly Plan
                    </button>
                    <button
                      onClick={() => setBillingCycle("yearly")}
                      className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all relative ${billingCycle === "yearly" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      Yearly Access
                      <span className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold scale-90">
                        SAVE 20%
                      </span>
                    </button>
                  </div>

                  <div className="mb-6 flex items-baseline justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Access Commitment</p>
                      <p className="text-4xl font-black text-slate-900 mt-1">
                        {currency}{billingCycle === "monthly" ? monthlyPrice : yearlyPrice}
                      </p>
                    </div>
                    {discount > 0 && (
                      <span className="text-sm line-through text-slate-400 font-normal bg-slate-100 px-2 py-1 rounded-md">
                        {currency}{billingCycle === "monthly" ? rawPrice.toFixed(2) : (rawPrice * 12).toFixed(2)}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs font-medium mb-6 text-center">
                  ✨ You are currently enrolled in this active course path!
                </div>
              )}

              {/* Perks List */}
              <ul className="space-y-3 mb-6 text-slate-600 text-xs">
                <li className="flex items-center gap-2">✔ Full streaming access to {calculateNoOfLectures(courseData)} lectures</li>
                <li className="flex items-center gap-2">✔ Downloadable course manuals & supplementary learning matrices</li>
                <li className="flex items-center gap-2">✔ Live workspace chat feeds & AI support model modules</li>
                <li className="flex items-center gap-2">✔ Shareable verified course completion certificate</li>
              </ul>

              <button
                onClick={handlePayment}
                className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all"
              >
                {isEnrolled ? "Open Learning Studio" : "Subscribe & Begin Learning"}
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-3">Secure encrypted checkout engine via Stripe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Module Overview Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-36 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Course Curriculum</h2>
            <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-xs">
              {courseData.courseContent?.map((chapter, cIdx) => {
                const isOpen = !!openChapters[cIdx];
                return (
                  <div key={cIdx} className="border-b border-slate-100 last:border-b-0">
                    {/* Accordion Header row */}
                    <button
                      onClick={() => toggleChapter(cIdx)}
                      className="w-full flex items-center justify-between p-5 text-left bg-slate-50/40 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="pr-4">
                        <h4 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-600 transition-colors">
                          {cIdx + 1}. {chapter.chapterTitle}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 font-normal">{chapter.chapterDescription}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-md">
                          {calculateChapterTime(chapter)} min
                        </span>
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Collapsible Nested Lecture Checklist items */}
                    {isOpen && (
                      <div className="bg-white divide-y divide-slate-50 border-t border-slate-100">
                        {chapter.chapterContent?.map((lecture, lIdx) => (
                          <div key={lIdx} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs font-medium text-slate-700">
                                {lecture.lectureTitle}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {lecture.lectureDuration || "0"}m
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetails;
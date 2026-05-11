import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";
import Youtube from "react-youtube";
import axios from "axios";
import { toast } from "react-toastify";

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      if (data.success) setCourseData(data.course);
      else toast.error(data.message || "Course not found");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const enrollCourse = async () => {
    try {
      if (!session?.user) return toast.warn("Please sign in first");
      if (isAlreadyEnrolled) return toast.warn("Already Enrolled");

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

  const handlePreviewClick = (lectureUrl) => {
    const videoId = getYouTubeId(lectureUrl);
    if (videoId) {
      setPlayerData({ videoId });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Could not load video. Please check the URL.");
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (userData && courseData && userData.enrolledCourses) {
      const isEnrolled = userData.enrolledCourses.some(
        (cId) => cId.toString() === courseData._id.toString()
      );
      setIsAlreadyEnrolled(isEnrolled);
    }
  }, [userData, courseData]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) return <Loading />;
  if (!courseData) return <div className="text-center pt-40">Course not found.</div>;

  return (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left bg-linear-to-b from-cyan-100/70">
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="text-2xl md:text-4xl font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>
          <p
            className="pt-4 md:text-base text-sm"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription?.slice(0, 200) + "...",
            }}
          />

          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateRating(courseData)}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank}
                  alt=""
                  className="w-3.5 h-3.5"
                />
              ))}
            </div>
            <p className="text-blue-600">({courseData.courseRatings?.length || 0} ratings)</p>
          </div>

          <p className="text-sm">
            Course by{" "}
            <span className="text-blue-600 underline">
              {courseData.educator?.name || "Educator"}
            </span>
          </p>

          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">What you'll learn</h2>
            <div className="pt-5">
              {courseData.courseContent?.map((chapter, index) => (
                <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={openSections[index] ? "rotate-180" : ""}
                        src={assets.down_arrow_icon}
                        alt=""
                      />
                      <p className="font-medium">{chapter.chapterTitle}</p>
                    </div>
                    <p className="text-sm">
                      {chapter.chapterContent?.length} lectures - {calculateChapterTime(chapter)}
                    </p>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`}
                  >
                    <ul className="list-disc pl-10 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent?.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img src={assets.play_icon} alt="" className="w-4 h-3 mt-1" />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-sm">
                            <p>{lecture.lectureTitle}</p>
                            {lecture.isPreviewFree && (
                              <p
                                onClick={() => handlePreviewClick(lecture.lectureUrl)}
                                className="text-blue-500 cursor-pointer font-medium"
                              >
                                Preview
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-course-card z-10 shadow-lg rounded overflow-hidden bg-white min-w-75 sticky top-24">
          {playerData ? (
            <Youtube
              videoId={playerData.videoId}
              opts={{ playerVars: { autoplay: 1 } }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img src={courseData.courseThumbnail} alt="" className="w-full" />
          )}
          <div className="p-5">
            <div className="flex gap-2 items-center">
              <img className="w-3.5" alt="" src={assets.time_left_clock_icon} />
              <p className="text-red-500">
                <span className="font-medium">5 days</span> left at this price
              </p>
            </div>

            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>
              <p className="line-through text-gray-500">
                {currency}
                {courseData.coursePrice}
              </p>
              <p className="text-green-600 font-medium">{courseData.discount}% off</p>
            </div>

            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-2">
                <img src={assets.star} alt="" />
                <p>{calculateRating(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-2">
                <img src={assets.time_clock_icon} alt="" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-2">
                <img src={assets.lesson_icon} alt="" />
                <p>{calculateNoOfLectures(courseData)} lessons</p>
              </div>
            </div>

            {!session?.user ? (
              <button
                onClick={signInWithGoogle}
                className="md:mt-6 mt-4 w-full py-3 rounded bg-gray-900 text-white font-medium cursor-pointer"
              >
                Sign in to Enroll
              </button>
            ) : (
              <button
                onClick={enrollCourse}
                className="md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium cursor-pointer hover:bg-blue-700 transition-colors"
              >
                {isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
              </button>
            )}

            <div className="pt-6">
              <p className="md:text-xl text-lg font-medium text-gray-800">What's in the Course</p>
              <ul className="list-disc ml-4 pt-2 text-gray-600 text-sm md:text-default">
                <li>Lifetime Access with updates</li>
                <li>Step-by-step Guidance</li>
                <li>Quizzes to test your knowledge after each lesson</li>
                <li>Downloadable resources</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetails;

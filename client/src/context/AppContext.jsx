import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const sanitizeEnvUrl = (value) =>
  (value || "").trim().replace(/[`'"]/g, "").replace(/\/$/, "");

export const AppContextProvider = (props) => {
  // IMPORTANT: prevents accidental backticks/quotes breaking requests
  const backendUrl = sanitizeEnvUrl(import.meta.env.VITE_BACKEND_URL);
  const currency = (import.meta.env.VITE_CURRENCY || "").replace(/[`'"]/g, "");

  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [session, setSession] = useState(null); // Auth.js session
  const [userData, setUserData] = useState(null); // Your API's user payload (if you keep /api/user/data)

  // Auth.js: cookie-based session (withCredentials: true)
  const fetchSession = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/session", {
        withCredentials: true,
      });
      setSession(data || null);

      // If you store roles in the Auth.js session callback:
      setIsEducator(data?.user?.role === "educator");
    } catch (err) {
      setSession(null);
      setIsEducator(false);
    }
  };

  const signInWithGoogle = async () => {
    // Auth.js Express supports provider routes under /api/auth
    window.location.href = backendUrl + "/api/auth/signin/google";
  };

  const signOut = async () => {
    window.location.href = backendUrl + "/api/auth/signout";
  };

  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/course/all");
      if (data.success) setAllCourses(data.courses);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUserData = async () => {
    // Only fetch if logged in (Auth.js session exists)
    if (!session?.user) return;

    try {
      const { data } = await axios.get(backendUrl + "/api/user/data", {
        withCredentials: true,
      });

      if (data.success) {
        setUserData(data.user);
      } else if (data.isSyncing) {
        setTimeout(fetchUserData, 1500);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUserEnrolledCourses = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/enrolled-courses", {
        withCredentials: true,
      });
      if (data.success) setEnrolledCourses(data.enrolledCourses.reverse());
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const calculateRating = (course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) return 0;
    let totalRating = 0;
    course.courseRatings.forEach((r) => (totalRating += r.rating));
    return Math.floor(totalRating / course.courseRatings.length);
  };

  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent?.forEach((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"], round: true });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent?.forEach((chapter) =>
      chapter.chapterContent?.forEach((lecture) => (time += lecture.lectureDuration || 0))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"], round: true });
  };

  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent?.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) totalLectures += chapter.chapterContent.length;
    });
    return totalLectures;
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    // Initial auth hydrate
    fetchSession();
  }, []);

  useEffect(() => {
    // When session changes, hydrate user-related data
    if (session?.user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    } else {
      setUserData(null);
      setEnrolledCourses([]);
    }
  }, [session]);

  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    enrolledCourses,
    fetchUserEnrolledCourses,
    backendUrl,
    userData,
    setUserData,
    fetchAllCourses,
    // Auth.js helpers
    session,
    fetchSession,
    signInWithGoogle,
    signOut,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

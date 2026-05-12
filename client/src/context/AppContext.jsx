import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const sanitizeEnvUrl = (value) =>
  (value || "").trim().replace(/[`'"]/g, "").replace(/\/$/, "");

const postNavigate = (url, fields = {}) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
};

const signInWithGoogle = () => {
  postNavigate(`${backendUrl}/api/auth/signin/google`, {
    callbackUrl: window.location.origin,
  });
};

const signOut = () => {
  postNavigate(`${backendUrl}/api/auth/signout`, {
    callbackUrl: window.location.origin,
  });
};

export const AppContextProvider = (props) => {
  const backendUrl = sanitizeEnvUrl(import.meta.env.VITE_BACKEND_URL);
  const currency = (import.meta.env.VITE_CURRENCY || "").replace(/[`'"]/g, "");
  const navigate = useNavigate();

  // Cookie sessions: always send cookies
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [session, setSession] = useState(null);
  const [isEducator, setIsEducator] = useState(false);

  const fetchSession = async () => {
    if (!backendUrl) return;

    try {
      const { data } = await axios.get(backendUrl + "/api/auth/session");
      setSession(data || null);
      setIsEducator(data?.user?.role === "educator");
    } catch {
      setSession(null);
      setIsEducator(false);
    }
  };

  // IMPORTANT: Auth.js (@auth/express) expects POST for these actions
  const signInWithGoogle = () => {
    if (!backendUrl) return toast.error("Missing VITE_BACKEND_URL");
    postNavigate(`${backendUrl}/api/auth/signin/google`, {
      callbackUrl: window.location.origin,
    });
  };

  const signOut = () => {
    if (!backendUrl) return toast.error("Missing VITE_BACKEND_URL");
    postNavigate(`${backendUrl}/api/auth/signout`, {
      callbackUrl: window.location.origin,
    });
  };

  const fetchAllCourses = async () => {
    if (!backendUrl) return;

    try {
      const { data } = await axios.get(backendUrl + "/api/course/all");
      if (data.success) setAllCourses(data.courses);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUserData = async () => {
    if (!session?.user || !backendUrl) return;

    try {
      const { data } = await axios.get(backendUrl + "/api/user/data");
      if (data.success) setUserData(data.user);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUserEnrolledCourses = async () => {
    if (!session?.user || !backendUrl) return;

    try {
      const { data } = await axios.get(backendUrl + "/api/user/enrolled-courses");
      if (data.success) setEnrolledCourses(data.enrolledCourses.reverse());
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const calculateRating = (course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) return 0;
    let totalRating = 0;
    course.courseRatings.forEach((rating) => (totalRating += rating.rating));
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
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    } else {
      setUserData(null);
      setEnrolledCourses([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const value = {
    backendUrl,
    currency,
    navigate,

    // auth
    session,
    fetchSession,
    signInWithGoogle,
    signOut,
    isEducator,
    setIsEducator,

    // data
    allCourses,
    fetchAllCourses,
    userData,
    setUserData,
    enrolledCourses,
    fetchUserEnrolledCourses,

    // helpers
    calculateRating,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
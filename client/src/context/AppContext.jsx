import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const sanitizeEnvUrl = (value) =>
  (value || "").trim().replace(/[`'"]/g, "").replace(/\/$/, "");

/**
 * Auth.js (@auth/express) expects POST for sign-in/sign-out actions.
 * These POSTs must include a csrfToken.
 */
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

export const AppContextProvider = (props) => {
  const backendUrl = sanitizeEnvUrl(import.meta.env.VITE_BACKEND_URL);
  const currency = (import.meta.env.VITE_CURRENCY || "").replace(/[`'"]/g, "");
  const navigate = useNavigate();

  // State Management
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [session, setSession] = useState(null);
  const [isEducator, setIsEducator] = useState(false);

  // Global Axios config for cookie sessions
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  // --- Auth Actions ---

  const fetchSession = async () => {
    if (!backendUrl) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/session`);
      setSession(data || null);
      setIsEducator(data?.user?.role === "educator");
    } catch {
      setSession(null);
      setIsEducator(false);
    }
  };

  const getCsrfToken = async () => {
    if (!backendUrl) return null;
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/csrf`);
      return data?.csrfToken || null;
    } catch (error) {
      console.error("CSRF fetch failed:", error.message);
      return null;
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (!backendUrl) return toast.error("Missing VITE_BACKEND_URL");

      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        // Fallback: redirect directly to signin page if CSRF fails
        window.location.href = `${backendUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(window.location.origin + "/student")}`;
        return;
      }

      // ─── FIXED: redirect to /student dashboard after login ───
      const callbackUrl = `${window.location.origin}/student`;

      postNavigate(`${backendUrl}/api/auth/signin/google`, {
        csrfToken,
        callbackUrl,
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const signOut = async () => {
    try {
      if (!backendUrl) return toast.error("Missing VITE_BACKEND_URL");
      const csrfToken = await getCsrfToken();
      if (!csrfToken) return toast.error("Could not get CSRF token");

      postNavigate(`${backendUrl}/api/auth/signout`, {
        csrfToken,
        callbackUrl: window.location.origin,
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const becomeEducator = async () => {
    try {
      if (!session?.user) {
        toast.info("Please sign in first");
        return signInWithGoogle();
      }

      const { data } = await axios.post(`${backendUrl}/api/user/become-educator`, {});

      if (!data?.success) return toast.error(data?.message || "Could not upgrade account");

      toast.success(data.message || "You are now an educator");
      await fetchSession();
      navigate("/educator");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // --- Data Fetching ---

  const fetchAllCourses = async () => {
    if (!backendUrl) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/all`);
      if (data.success) setAllCourses(data.courses);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUserData = async () => {
    if (!session?.user || !backendUrl) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) setUserData(data.user);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUserEnrolledCourses = async () => {
    if (!session?.user || !backendUrl) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`);
      if (data.success) setEnrolledCourses(data.enrolledCourses.reverse());
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // --- Helper Calculators ---

  const calculateRating = (course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) return 0;
    const totalRating = course.courseRatings.reduce((acc, curr) => acc + curr.rating, 0);
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

  // Lifecycle
  useEffect(() => {
    fetchAllCourses();
    fetchSession();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    } else {
      setUserData(null);
      setEnrolledCourses([]);
    }
  }, [session]);

  const value = {
    backendUrl,
    currency,
    navigate,
    session,
    fetchSession,
    signInWithGoogle,
    signOut,
    becomeEducator,
    isEducator,
    setIsEducator,
    allCourses,
    fetchAllCourses,
    userData,
    setUserData,
    enrolledCourses,
    fetchUserEnrolledCourses,
    calculateRating,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
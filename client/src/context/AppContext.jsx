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

/**
 * Check if an error is CORS-related
 */
const isCorsError = (error) => {
  if (!error) return false;
  const message = error.message || "";
  const code = error.code || "";
  return (
    code === "ERR_NETWORK" ||
    code === "ECONNABORTED" ||
    message.includes("Network Error") ||
    message.includes("CORS") ||
    message.includes("Cross-Origin")
  );
};

/**
 * Handle API errors with proper CORS detection
 */
const handleApiError = (error, contextMessage) => {
  if (isCorsError(error)) {
    console.error(`CORS Error in ${contextMessage}:`, error);
    toast.error(
      `Connection blocked by CORS policy. Please check that your backend URL (${sanitizeEnvUrl(import.meta.env.VITE_BACKEND_URL)}) has CORS enabled for this frontend origin (${window.location.origin}).`,
      { autoClose: 8000 }
    );
    return { isCors: true, error };
  }

  const serverMessage = error.response?.data?.message;
  const statusCode = error.response?.status;

  if (statusCode === 401) {
    toast.error("Session expired. Please sign in again.");
    return { isAuthError: true, error };
  }

  if (statusCode === 403) {
    toast.error("Access denied. You don't have permission.");
    return { isAuthError: true, error };
  }

  if (serverMessage) {
    toast.error(serverMessage);
  } else {
    toast.error(error.message || `${contextMessage} failed`);
  }

  return { error };
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
  const [isLoading, setIsLoading] = useState(true);
  const [corsError, setCorsError] = useState(false);

  // Global Axios config for cookie sessions
  useEffect(() => {
    axios.defaults.withCredentials = true;

    // Add a response interceptor to catch CORS errors globally
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isCorsError(error)) {
          console.error("Global CORS Error:", error);
          setCorsError(true);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // --- Auth Actions ---

  const fetchSession = async () => {
    if (!backendUrl) {
      console.error("VITE_BACKEND_URL is not set");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/auth/session`, {
        withCredentials: true,
        // Add timeout to avoid hanging on CORS-blocked requests
        timeout: 10000,
      });
      setSession(data || null);
      setIsEducator(data?.user?.role === "educator");
      setCorsError(false);
    } catch (error) {
      console.error("fetchSession error:", error.message);
      if (isCorsError(error)) {
        setCorsError(true);
      }
      setSession(null);
      setIsEducator(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getCsrfToken = async () => {
    if (!backendUrl) return null;
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/csrf`, {
        withCredentials: true,
        timeout: 10000,
      });
      return data?.csrfToken || null;
    } catch (error) {
      console.error("CSRF fetch failed:", error.message);
      if (isCorsError(error)) {
        setCorsError(true);
        toast.error("Cannot connect to authentication server. CORS issue detected.");
      }
      return null;
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (!backendUrl) {
        return toast.error("Missing VITE_BACKEND_URL environment variable");
      }

      const csrfToken = await getCsrfToken();
      const callbackUrl = `${window.location.origin}/student`;

      if (csrfToken) {
        // ─── Standard Auth.js flow: POST with CSRF ───
        postNavigate(`${backendUrl}/api/auth/signin/google`, {
          csrfToken,
          callbackUrl,
        });
      } else {
        // ─── Fallback: redirect directly to signin endpoint ───
        console.warn("CSRF token missing, using fallback redirect");
        window.location.href = `${backendUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      }
    } catch (error) {
      toast.error(error.message || "Sign in failed");
    }
  };

  const signOut = async () => {
    try {
      if (!backendUrl) return toast.error("Missing VITE_BACKEND_URL");
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        // Fallback: redirect to signout
        window.location.href = `${backendUrl}/api/auth/signout?callbackUrl=${encodeURIComponent(window.location.origin)}`;
        return;
      }

      postNavigate(`${backendUrl}/api/auth/signout`, {
        csrfToken,
        callbackUrl: window.location.origin,
      });
    } catch (error) {
      toast.error(error.message || "Sign out failed");
    }
  };

  const becomeEducator = async () => {
    try {
      if (!session?.user) {
        toast.info("Please sign in first");
        return signInWithGoogle();
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/become-educator`,
        {},
        { withCredentials: true, timeout: 15000 }
      );

      if (!data?.success) return toast.error(data?.message || "Could not upgrade account");

      toast.success(data.message || "You are now an educator");
      await fetchSession();
      navigate("/educator");
    } catch (error) {
      handleApiError(error, "Become educator");
    }
  };

  // --- Data Fetching ---

  const fetchAllCourses = async () => {
    if (!backendUrl) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/all`, {
        timeout: 15000,
      });
      if (data.success) setAllCourses(data.courses);
      else toast.error(data.message);
    } catch (error) {
      handleApiError(error, "Fetch courses");
    }
  };

  const fetchUserData = async () => {
    if (!session?.user || !backendUrl) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        withCredentials: true,
        timeout: 15000,
      });
      if (data.success) setUserData(data.user);
      else toast.error(data.message);
    } catch (error) {
      handleApiError(error, "Fetch user data");
    }
  };

  const fetchUserEnrolledCourses = async () => {
    if (!session?.user || !backendUrl) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
        withCredentials: true,
        timeout: 15000,
      });
      if (data.success) setEnrolledCourses(data.enrolledCourses.reverse());
      else toast.error(data.message);
    } catch (error) {
      handleApiError(error, "Fetch enrolled courses");
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
    isLoading,
    corsError,
  };

  return (
    <AppContext.Provider value={value}>
      {corsError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 text-center text-sm">
          <strong>CORS Error:</strong> Cannot connect to backend. Please check that{" "}
          <code className="bg-red-800 px-1 py-0.5 rounded">{backendUrl}</code> allows requests from{" "}
          <code className="bg-red-800 px-1 py-0.5 rounded">{window.location.origin}</code>.
          <button
            onClick={() => fetchSession()}
            className="ml-4 underline hover:no-underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}
      {props.children}
    </AppContext.Provider>
  );
};
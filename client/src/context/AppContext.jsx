import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  
  const [backendUrl] = useState(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [currency] = useState('$');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/profile`, {
          withCredentials: true
        });
        if (data.success) {
          setUserData(data.user);
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [backendUrl]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/courses/all`);
        if (data.success) {
          setAllCourses(data.courses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, [backendUrl]);

  const fetchUserEnrolledCourses = async () => {
    if (!userData?._id) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });
      if (data.success) {
        setEnrolledCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const calculateRating = (course) => {
    if (!course?.courseRatings?.length) return 0;
    const sum = course.courseRatings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / course.courseRatings.length).toFixed(1);
  };

  const calculateNoOfLectures = (course) => {
    if (!course?.courseContent) return 0;
    return course.courseContent.reduce((acc, chapter) => 
      acc + (chapter.chapterContent?.length || 0), 0
    );
  };

  const calculateCourseDuration = (course) => {
    if (!course?.courseContent) return '0h 0m';
    const totalMinutes = course.courseContent.reduce((acc, chapter) => 
      acc + chapter.chapterContent?.reduce((sum, lecture) => 
        sum + (lecture.lectureDuration || 0), 0) || 0, 0
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const calculateChapterTime = (chapter) => {
    if (!chapter?.chapterContent) return '0m';
    const totalMinutes = chapter.chapterContent.reduce((acc, lecture) => 
      acc + (lecture.lectureDuration || 0), 0
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const value = {
    backendUrl,
    userData,
    setUserData,
    enrolledCourses,
    setEnrolledCourses,
    allCourses,
    currency,
    navigate,
    calculateRating,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    fetchUserEnrolledCourses,
    isLoading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
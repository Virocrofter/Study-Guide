import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const Loading = () => {
  const { path } = useParams();
  const { navigate } = useContext(AppContext);

  useEffect(() => {
    if (path) {
      const decodedPath = decodeURIComponent(path);
      const timer = setTimeout(() => {
        navigate(decodedPath);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [path, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading your content...</p>
      </div>
    </div>
  );
};

export default Loading;
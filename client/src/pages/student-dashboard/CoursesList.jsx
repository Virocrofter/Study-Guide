import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import Searchbar from '../../components/student/Searchbar';
import CourseCard from '../../components/student/CourseCard';
import Loading from '../../components/student/Loading';

const BrowseCourses = () => {
  const { allCourses } = useContext(AppContext);
  const { input } = useParams();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      if (input) {
        const searchTerm = input.toLowerCase();
        const filtered = allCourses.filter(course => 
          course.courseTitle?.toLowerCase().includes(searchTerm) ||
          course.courseDescription?.toLowerCase().includes(searchTerm) ||
          course.educator?.name?.toLowerCase().includes(searchTerm)
        );
        setFilteredCourses(filtered);
      } else {
        setFilteredCourses(allCourses || []);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [input, allCourses]);

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {input ? `Search Results for "${decodeURIComponent(input)}"` : 'Browse All Courses'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
        </p>
        <Searchbar />
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No courses found</h3>
          <p className="text-gray-500">
            {input ? `We couldn't find any courses matching "${decodeURIComponent(input)}"` : 'No courses available at the moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCourses;
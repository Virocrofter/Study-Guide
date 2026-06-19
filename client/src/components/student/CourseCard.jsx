import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
    // Defensive check to ensure the component doesn't crash if 'course' is undefined
    if (!course) {
        return <div className="bg-gray-100 animate-pulse h-64 rounded-lg"></div>;
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
            {course.courseThumbnail && (
                <img 
                    src={course.courseThumbnail} 
                    alt={course.courseTitle || 'Course Image'} 
                    className="w-full h-48 object-cover"
                />
            )}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.courseTitle || 'Untitled Course'}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {course.courseDescription || 'No description provided.'}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-md font-bold text-indigo-600">
                        {course.coursePrice === 0 ? 'Free' : `$${course.coursePrice}`}
                    </span>
                    <Link 
                        to={`/course/${course._id}`}
                        className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded transition-colors"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
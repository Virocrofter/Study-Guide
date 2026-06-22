import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const CourseCard = ({ course }) => {
  const { navigate, currency, calculateRating } = useContext(AppContext);

  const discountedPrice = course.coursePrice * (100 - (course.discount || 0)) / 100;

  return (
    <div 
      onClick={() => navigate(`/course/${course._id}`)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group"
    >
      <div className="relative">
        <img 
          src={course.courseThumbnail} 
          alt={course.courseTitle} 
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            -{course.discount}%
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm leading-tight">
          {course.courseTitle}
        </h3>
        
        <p className="text-xs text-gray-500 mb-3">{course.educator?.name || 'Unknown Educator'}</p>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-500 font-bold text-sm">{calculateRating(course)}</span>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((star) => (
              <img 
                key={star}
                src={star <= Math.round(calculateRating(course)) ? assets.star : assets.star_blank} 
                alt="" 
                className="w-3.5 h-3.5"
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({course.courseRatings?.length || 0})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-900">
              {currency}{discountedPrice.toFixed(2)}
            </span>
            {course.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                {currency}{course.coursePrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
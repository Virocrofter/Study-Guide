import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext);

  const finalPrice = (
    course.coursePrice -
    (course.discount * course.coursePrice) / 100
  ).toFixed(2);

  const rating = calculateRating(course);

  return (
    <Link
      to={`/course/${course._id}`}
      onClick={() => scrollTo(0, 0)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 ease-out flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video">
        <img 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          src={course.courseThumbnail} 
          alt={course.courseTitle} 
        />
        {course.discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {course.discount}% OFF
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {course.courseContent?.length || 0} Chapters
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {course.enrolledStudents?.length || 0} Students
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.courseTitle}
        </h3>

        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {course.courseDescription?.replace(/<<[^>]*>/g, '').slice(0, 100)}...
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
              {course.educator?.name?.charAt(0) || "E"}
            </div>
            <span className="text-sm font-medium text-slate-600">
              {course.educator?.name || "Expert Educator"}
            </span>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 mb-1 justify-end">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-300 fill-slate-300"}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-slate-500 ml-1">({rating})</span>
            </div>
            <p className="text-lg font-bold text-slate-800">
              {currency}{finalPrice}
              {course.discount > 0 && (
                <span className="text-sm text-slate-400 line-through ml-2 font-normal">
                  {currency}{course.coursePrice}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
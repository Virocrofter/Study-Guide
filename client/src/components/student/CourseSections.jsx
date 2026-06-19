import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";
import CourseCard from "./CourseCard";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const CourseSections = () => {
  const { allCourses } = useContext(AppContext);
  const headerRef = useScrollReveal();

  return (
    <section className="py-20 md:px-40 px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div
          ref={headerRef}
          className="reveal-up flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">
              Featured Courses
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Explore Our Top-Rated <br className="hidden md:block" />
              <span className="text-gradient">Learning Paths</span>
            </h2>
          </div>
          <Link
            to="/course-list"
            onClick={() => window.scrollTo(0, 0)}
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
          >
            View All Courses
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allCourses.slice(0, 4).map((course, index) => (
            <CourseCard key={course._id || index} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseSections;
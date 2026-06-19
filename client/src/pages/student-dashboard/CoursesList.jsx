import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Searchbar from "../../components/student/Searchbar";
import CourseCard from "../../components/student/CourseCard";
import { assets } from "../../assets/assets";

const BrowseCourses = () => {
  const { navigate, allCourses } = useContext(AppContext);
  const { input } = useParams();
  const [filteredCourse, setFilteredCourse] = useState([]);

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const tempCourses = allCourses.slice();

      input
        ? setFilteredCourse(
            tempCourses.filter((item) =>
              item.courseTitle.toLowerCase().includes(input.toLowerCase())
            )
          )
        : setFilteredCourse(tempCourses);
    }
  }, [allCourses, input]);

  return (
    <div className="relative pt-4 text-left">
      <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Browse Courses</h1>
          <p className="text-xs text-gray-500 mt-1">Explore available study tracks and curricula</p>
        </div>
        <Searchbar data={input} />
      </div>

      {input && (
        <div className="inline-flex items-center gap-4 px-4 py-2 border mt-6 text-gray-600 rounded-xl bg-white border-slate-200 text-xs">
          <p>{input}</p>
          <img
            src={assets.cross_icon}
            alt="Clear filter"
            className="cursor-pointer w-3 h-3"
            onClick={() => navigate("/student/browse")}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-10 gap-4">
        {filteredCourse.map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </div>
    </div>
  );
};

export default BrowseCourses;
import React, { useEffect } from 'react'
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';  // ← ADDED: useNavigate
import CourseCard from '../../components/student/CourseCard'
import { useState } from 'react';
import Searchbar from '../../components/student/Searchbar';
import { assets } from '../../assets/assets';  // ← ADDED: assets for search icon

const BrowseCourses = () => {

  const { navigate, allCourses } = useContext(AppContext);
  const { input } = useParams();
  const [filteredCourse, setFilteredCourse] = useState([]);

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const tempCourses = allCourses.slice()

      input
        ? setFilteredCourse(tempCourses.filter(
          item => item.courseTitle.toLowerCase().includes(input.toLowerCase())
        ))
        : setFilteredCourse(tempCourses)
    }
  }, [allCourses, input])

  return (
    <>
      <div className='relative md:px-36 pt-20 text-left'>
        <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full'>
          <div>
            <h1 className='text-4xl font-semibold text-gray-800'>Browse Courses</h1>
            <p className='text-gray-500'>
              <span className='text-blue-600 cursor-pointer' onClick={() => navigate('/student')}>Dashboard</span>
              {" / "}
              <span className='text-blue-600 cursor-pointer' onClick={() => navigate('/student/browse')}>Browse</span>
              {input && ` / Search: "${input}"`}
            </p>
          </div>
          {/* Dashboard searchbar that navigates to /student/browse/:input */}
          <DashboardSearchbar data={input} />
        </div>

        {input && (
          <div className='inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600'>
            <p>Results for: "{input}"</p>
            <span 
              className='cursor-pointer text-red-500 font-bold' 
              onClick={() => { navigate('/student/browse'); window.scrollTo(0, 0); }}
            >
              ✕ Clear
            </span>
          </div>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0'>
          {
            filteredCourse.map((course, index) => <CourseCard key={index} course={course} />)
          }
        </div>

        {filteredCourse.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No courses found{input ? ` for "${input}"` : ''}</p>
            <button 
              onClick={() => navigate('/student/browse')} 
              className="mt-4 text-blue-600 hover:underline"
            >
              View all courses
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// Dashboard-specific searchbar that routes to /student/browse
const DashboardSearchbar = ({ data }) => {
  const navigate = useNavigate();  // ← This now works because useNavigate is imported above
  const [input, setInput] = useState(data ? data : '')

  const onSearchHandler = (e) => {
    e.preventDefault();
    navigate('/student/browse/' + input);
  }

  return (
    <form onSubmit={onSearchHandler} className='max-w-xl w-full md:h-14 h-12 flex items-center bg-white border border-gray-500/80 rounded'>
      <img src={assets.search_icon} alt="search_icon" className='md:w-auto w-10 px-3' />
      <input 
        onChange={e => setInput(e.target.value)} 
        value={input} 
        type="text" 
        placeholder='Search for courses' 
        className='w-full h-full outline-none text-gray-500/80' 
      />
      <button type='submit' className='bg-blue-600 rounded text-white md:px-10 px-7 py-2 mx-1'>Search</button>
    </form>
  )
}

export default BrowseCourses
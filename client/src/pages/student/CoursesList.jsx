import React, { useEffect, useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Searchbar from '../../components/student/Searchbar';
import CourseCard from '../../components/student/CourseCard'
import { assets } from '../../assets/assets';

const CoursesList = () => {

  const navigate = useNavigate();
  const {allCourses} = useContext(AppContext);
  const {input} = useParams();
  const [filteredCourse, setFilteredCourse] = useState([]);

  useEffect(()=>{
    if(allCourses && allCourses.length > 0){
      const tempCourses = allCourses.slice()
      input ?
        setFilteredCourse(tempCourses.filter(
          item => item.courseTitle.toLowerCase().includes(input.toLowerCase())
        ))
      : setFilteredCourse(tempCourses)
    }
  },[allCourses, input])

  return (
    <div className='relative md:px-36 pt-10 text-left'>
      <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full'>
        <div>
          <h1 className='text-4xl font-semibold text-gray-800'>Browse Courses</h1>
          <p className='text-gray-500'>
            <span className='text-blue-600 cursor-pointer' onClick={()=> navigate('/student')}>Dashboard</span>
             / Browse
          </p>
        </div>
        <Searchbar data={input} />
      </div>
      { input && (
        <div className='inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600'>
          <p>{input}</p>
          <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={()=> navigate('/student/browse')} />
        </div>
      )}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0'>
        {
          filteredCourse.map ((course, index) => <CourseCard key={index} course={course} />)
        }
      </div>
    </div>
  )
}

export default CoursesList
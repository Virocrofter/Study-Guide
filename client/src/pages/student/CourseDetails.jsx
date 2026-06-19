import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { toast } from 'react-toastify'

const CourseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { backendUrl, isLoggedin, token } = useContext(AppContext)

  // FIXED: Initialized state as course/setCourse instead of data/setData
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/user/course-data', { courseId: id }, { headers: { token } })
      if (response.data.success) {
        // FIXED: Set the fetched data to the course state variable
        setCourse(response.data.courseData)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedin && token) {
      fetchCourseDetails()
    }
  }, [isLoggedin, token, id])

  // FIXED: This will now log the state successfully without throwing a ReferenceError
  console.log(course)

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      <div className='max-w-4xl mx-auto p-4 pt-10'>
        <button onClick={() => navigate('/')} className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-all'>
          ← Back to Dashboard
        </button>
        
        <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
          <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
            <div>
              <span className='bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider'>
                Course Workspace
              </span>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mt-2'>{course?.title}</h1>
            </div>
            <button 
              onClick={() => navigate(`/study/${id}`)}
              className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-100'
            >
              Enter Study Room
            </button>
          </div>

          <p className='text-gray-600 leading-relaxed mb-8'>{course?.description}</p>

          <div className='border-t border-gray-100 pt-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Syllabus Modules</h3>
            <div className='space-y-3'>
              {course?.modules && course.modules.length > 0 ? (
                course.modules.map((mod, index) => (
                  <div key={index} className='flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100'>
                    <div className='bg-blue-100 text-blue-700 font-semibold w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0'>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-900'>{mod.name}</h4>
                      <p className='text-xs text-gray-500 mt-0.5'>{mod.description || 'No description provided for this node module.'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-sm text-gray-400 italic'>No structured curriculum modules listed for this course track yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CourseDetails
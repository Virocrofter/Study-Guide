import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import CourseCard from '../../components/student/CourseCard';

const Library = () => {
    const { enrolledCourses } = useContext(AppContext);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">My Enrolled Library</h2>
            
            {enrolledCourses && enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((item) => {
                        // Extracting the nested course data structure securely
                        const absoluteCourseData = item.course || item;
                        return (
                            <CourseCard 
                                key={item._id || absoluteCourseData._id} 
                                course={absoluteCourseData} 
                            />
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
            )}
        </div>
    );
};

export default Library;
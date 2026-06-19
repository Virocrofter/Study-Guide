import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import CourseCard from '../../components/student/CourseCard';

const CoursesList = () => {
    const { allCourses } = useContext(AppContext);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Browse All Courses</h1>
            
            {allCourses && allCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {allCourses.map((course) => (
                        // Explicitly assigning the scoped 'course' variable to the 'course' prop
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No courses available at the moment. Check back soon!</p>
                </div>
            )}
        </div>
    );
};

export default CoursesList;
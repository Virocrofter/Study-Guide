import React, { useContext, useEffect, useState } from "react";
import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const StudentsEnrolled = () => {
  const { backendUrl, isEducator } = useContext(AppContext);
  const [enrolledStudents, setEnrolledStudents] = useState(null);

  const fetchEnrolledStudents = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/enrolled-students`, {
        withCredentials: true,
      });

      if (data.success) {
        setEnrolledStudents(data.enrolledStudents);
      } else {
        toast.error(data.message);
        setEnrolledStudents([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setEnrolledStudents([]);
    }
  };

  useEffect(() => {
    if (isEducator) fetchEnrolledStudents();
  }, [isEducator]);

  if (enrolledStudents === null) return <Loading />;

  return (
    <div className="min-h-screen flex flex-col items-start justify-start md:p-8 p-4 pt-8">
      <h1 className="text-2xl font-semibold mb-6">Enrolled Students</h1>
      <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20 shadow-sm">
        <table className="table-auto w-full overflow-hidden">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
              <th className="px-4 py-3 font-semibold">Student Name</th>
              <th className="px-4 py-3 font-semibold">Course Title</th>
              <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {enrolledStudents.length > 0 ? (
              enrolledStudents.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-500/10 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-400">
                    {index + 1}
                  </td>
                  <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                    <img
                      src={item.student?.imageUrl || assets.user_icon}
                      alt="profile"
                      className="w-9 h-9 rounded-full object-cover bg-gray-100"
                    />
                    <span className="truncate font-medium">
                      {item.student?.name || "Unknown Student"}
                    </span>
                  </td>
                  <td className="px-4 py-3 truncate text-sm">{item.courseTitle}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-center text-sm">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Pending"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-20 text-gray-500">
                  No students enrolled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsEnrolled;

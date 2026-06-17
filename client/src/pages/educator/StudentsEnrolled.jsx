import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const StudentsEnrolled = () => {
  const { backendUrl, isEducator } = useContext(AppContext);
  const [enrolledStudents, setEnrolledStudents] = useState(null);

  const fetchEnrolledStudents = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/enrolled-students`, {
        withCredentials: true,
      });
      if (data.success) setEnrolledStudents(data.enrolledStudents);
      else {
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

  if (enrolledStudents === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full pb-20 ml-24 pt-8 px-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Enrolled Students</h1>
        <p className="text-slate-500 mt-1">All students currently learning from your courses.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrolledStudents.length > 0 ? (
                enrolledStudents.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                          {(item.student?.name || "S").charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.student?.name || "Unknown"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.courseTitle}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Pending"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p>No students enrolled yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsEnrolled;
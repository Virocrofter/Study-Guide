import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const StudentAssignments = () => {
  const { backendUrl, userData, enrolledCourses } = useContext(AppContext);
  const [submissions, setSubmissions] = useState([]);
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    try {
      const { data: subData } = await axios.get(
        `${backendUrl}/api/user/quiz-submissions`,
        { withCredentials: true }
      );
      if (subData.success) setSubmissions(subData.submissions);

      const pending = [];
      for (const course of enrolledCourses || []) {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/user/quizzes/${course._id}`,
            { withCredentials: true }
          );
          if (data.success) {
            const notSubmitted = data.quizzes.filter((q) => !q.submitted);
            pending.push(...notSubmitted.map((q) => ({
              ...q,
              courseTitle: course.courseTitle,
              courseId: course._id,
              courseThumbnail: course.courseThumbnail,
            })));
          }
        } catch (e) {
          console.error(e);
        }
      }
      setPendingQuizzes(pending);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) fetchAssignments();
  }, [userData, enrolledCourses]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full pb-20 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
        <p className="text-slate-500 mt-1">Track your quizzes and assessments.</p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Pending Quizzes</h2>
        {pendingQuizzes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-slate-400">No pending quizzes. You're all caught up!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pendingQuizzes.map((quiz, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">PENDING</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{quiz.title}</h4>
                <p className="text-sm text-slate-500 mb-4">{quiz.courseTitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{quiz.questions?.length || 0} questions</span>
                  <button
                    onClick={() => navigate(`/course/${quiz.courseId}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Completed</h2>
        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-slate-400">No completed quizzes yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div key={sub._id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    sub.percentage >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {sub.percentage}%
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{sub.quizId?.title || "Quiz"}</h4>
                    <p className="text-sm text-slate-500">{sub.courseId?.courseTitle || ""}</p>
                    <p className="text-xs text-slate-400">
                      {sub.score}/{sub.totalQuestions} correct • {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  sub.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}>
                  {sub.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
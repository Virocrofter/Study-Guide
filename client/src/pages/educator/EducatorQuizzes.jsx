import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const EducatorQuizzes = () => {
  const { backendUrl, isEducator } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, { withCredentials: true });
      if (data.success) {
        setCourses(data.courses);
        if (data.courses.length > 0) setSelectedCourse(data.courses[0]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    if (!selectedCourse) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/educator/quizzes/${selectedCourse._id}`,
        { withCredentials: true }
      );
      if (data.success) setQuizzes(data.quizzes);
    } catch (err) {
      console.error(err);
    }
  };

  const createQuiz = async () => {
    if (!quizTitle.trim()) return toast.error("Enter a quiz title");
    if (questions.some((q) => !q.questionText.trim() || q.options.some((o) => !o.trim()))) {
      return toast.error("Fill in all questions and options");
    }
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/educator/quizzes/${selectedCourse._id}`,
        { title: quizTitle, questions },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Quiz created!");
        setQuizzes([data.quiz, ...quizzes]);
        setShowAdd(false);
        setQuizTitle("");
        setQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswer: 0 }]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/quizzes/${quizId}`,
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Deleted");
        setQuizzes(quizzes.filter((q) => q._id !== quizId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (isEducator) fetchCourses();
  }, [isEducator]);

  useEffect(() => {
    if (selectedCourse) fetchQuizzes();
  }, [selectedCourse]);

  if (loading) return <div className="h-full flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-full pb-20 space-y-8 pt-8 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quizzes</h1>
          <p className="text-slate-500 mt-1">Create and manage quizzes for your courses.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Quiz
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {courses.map((course) => (
          <button
            key={course._id}
            onClick={() => setSelectedCourse(course)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCourse?._id === course._id
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {course.courseTitle}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800">New Quiz</h3>
          <input
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Quiz Title"
            className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Question {qIdx + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="text-xs text-red-500 hover:text-red-700">
                    Remove
                  </button>
                )}
              </div>
              <input
                value={q.questionText}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[qIdx].questionText = e.target.value;
                  setQuestions(newQuestions);
                }}
                placeholder="Question text"
                className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIdx}`}
                      checked={q.correctAnswer === oIdx}
                      onChange={() => {
                        const newQuestions = [...questions];
                        newQuestions[qIdx].correctAnswer = oIdx;
                        setQuestions(newQuestions);
                      }}
                      className="w-4 h-4"
                    />
                    <input
                      value={opt}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[qIdx].options[oIdx] = e.target.value;
                        setQuestions(newQuestions);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      className="flex-1 bg-white rounded-lg px-3 py-1.5 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() => setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctAnswer: 0 }])}
            className="text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            + Add Question
          </button>
          <div className="flex gap-3">
            <button onClick={createQuiz} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Quiz</button>
            <button onClick={() => setShowAdd(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800">{quiz.title}</h4>
              <p className="text-sm text-slate-500">{quiz.questions.length} questions • Created {new Date(quiz.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => deleteQuiz(quiz._id)} className="text-slate-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
            <p>No quizzes yet for this course.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducatorQuizzes;
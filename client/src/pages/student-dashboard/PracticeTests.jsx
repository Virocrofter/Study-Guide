import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const PracticeTests = () => {
  const { backendUrl, userData, enrolledCourses } = useContext(AppContext);
  const [tests, setTests] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [newTest, setNewTest] = useState({
    title: "",
    courseId: "",
    timeLimit: 15,
    questions: [{ questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }],
  });
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/practice-tests`, {
        withCredentials: true,
      });
      if (data.success) setTests(data.tests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTest = async () => {
    if (!newTest.title.trim()) return toast.error("Enter a title");
    if (newTest.questions.some((q) => !q.questionText.trim() || q.options.some((o) => !o.trim()))) {
      return toast.error("Fill all questions and options");
    }
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/practice-tests`, newTest, {
        withCredentials: true,
      });
      if (data.success) {
        setTests([data.test, ...tests]);
        setShowAdd(false);
        setNewTest({ title: "", courseId: "", timeLimit: 15, questions: [{ questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }] });
        toast.success("Practice test created!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteTest = async (id) => {
    if (!confirm("Delete this test?")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/user/practice-tests/${id}`, {
        withCredentials: true,
      });
      if (data.success) {
        setTests(tests.filter((t) => t._id !== id));
        toast.success("Deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const startTest = (test) => {
    setActiveTest(test);
    setAnswers({});
    setTestResult(null);
    setTimer(test.timeLimit * 60);
    setTimerActive(true);
  };

  const submitTest = async () => {
    setTimerActive(false);
    const timeTaken = activeTest.timeLimit * 60 - timer;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/practice-tests/${activeTest._id}/attempt`,
        { answers, duration: timeTaken },
        { withCredentials: true }
      );
      if (data.success) {
        setTestResult(data.result);
        fetchTests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timerActive && timer === 0) {
      submitTest();
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  useEffect(() => {
    if (userData) fetchTests();
  }, [userData]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full pb-20 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Practice Tests</h1>
          <p className="text-slate-500 mt-1">Create custom tests and track your performance.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Test
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-slate-900">{tests.length}</p>
          <p className="text-sm text-slate-500">Tests Created</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-emerald-600">
            {tests.reduce((acc, t) => acc + (t.attempts?.length || 0), 0)}
          </p>
          <p className="text-sm text-slate-500">Total Attempts</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-blue-600">
            {tests.length > 0
              ? Math.round(
                  tests.reduce((acc, t) => {
                    const last = t.attempts?.[t.attempts.length - 1];
                    return acc + (last?.percentage || 0);
                  }, 0) / tests.length
                )
              : 0}
            %
          </p>
          <p className="text-sm text-slate-500">Avg Last Score</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-violet-600">
            {tests.filter((t) => t.attempts?.some((a) => a.percentage >= 70)).length}
          </p>
          <p className="text-sm text-slate-500">Tests Passed</p>
        </div>
      </div>

      {activeTest && !testResult && (
        <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{activeTest.title}</h3>
              <p className="text-sm text-slate-500">{activeTest.questions.length} questions</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              timer < 60 ? "bg-red-100 text-red-700" : "bg-white text-slate-700"
            }`}>
              ⏱ {formatTime(timer)}
            </div>
          </div>

          <div className="space-y-6">
            {activeTest.questions.map((q, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200">
                <p className="font-medium text-slate-800 mb-3">{idx + 1}. {q.questionText}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => setAnswers({ ...answers, [idx]: optIdx })}
                      className={`text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                        answers[idx] === optIdx
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}. {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={submitTest}
            disabled={Object.keys(answers).length !== activeTest.questions.length}
            className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Submit Test ({Object.keys(answers).length}/{activeTest.questions.length} answered)
          </button>
        </div>
      )}

      {testResult && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-slate-800">{testResult.percentage}%</p>
            <p className="text-sm text-slate-500">
              {testResult.score}/{testResult.totalQuestions} correct • {formatTime(testResult.duration)} taken
            </p>
            <p className={`text-lg font-bold mt-2 ${testResult.passed ? "text-emerald-600" : "text-amber-600"}`}>
              {testResult.passed ? "Passed!" : "Keep practicing!"}
            </p>
          </div>
          <div className="space-y-4">
            {activeTest.questions.map((q, idx) => (
              <div key={idx} className={`rounded-xl p-4 ${
                answers[idx] === q.correctAnswer ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
              }`}>
                <p className="font-medium text-slate-800 mb-2">{idx + 1}. {q.questionText}</p>
                <p className="text-sm">
                  Your answer: <span className={answers[idx] === q.correctAnswer ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>
                    {q.options[answers[idx]] || "Not answered"}
                  </span>
                </p>
                {answers[idx] !== q.correctAnswer && (
                  <p className="text-sm text-emerald-700 mt-1">Correct: {q.options[q.correctAnswer]}</p>
                )}
                {q.explanation && <p className="text-xs text-slate-500 mt-2">{q.explanation}</p>}
              </div>
            ))}
          </div>
          <button
            onClick={() => { setActiveTest(null); setTestResult(null); setAnswers({}); }}
            className="w-full mt-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            Back to Tests
          </button>
        </div>
      )}

      {!activeTest && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => {
            const lastAttempt = test.attempts?.[test.attempts.length - 1];
            return (
              <div key={test._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <button
                    onClick={() => deleteTest(test._id)}
                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{test.title}</h4>
                <p className="text-sm text-slate-500 mb-3">{test.questions.length} questions • {test.timeLimit} min</p>
                {lastAttempt && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      lastAttempt.percentage >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      Last: {lastAttempt.percentage}%
                    </span>
                    <span className="text-xs text-slate-400">{test.attempts.length} attempts</span>
                  </div>
                )}
                <button
                  onClick={() => startTest(test)}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  {lastAttempt ? "Retake Test" : "Start Test"}
                </button>
              </div>
            );
          })}
          {tests.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No practice tests yet</h3>
              <p className="text-slate-400">Create custom tests to assess your knowledge.</p>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">New Practice Test</h3>
            <div className="space-y-3">
              <input
                placeholder="Test Title"
                value={newTest.title}
                onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={newTest.courseId}
                onChange={(e) => setNewTest({ ...newTest, courseId: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Standalone (no course)</option>
                {enrolledCourses?.map((c) => (
                  <option key={c._id} value={c._id}>{c.courseTitle}</option>
                ))}
              </select>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">Time Limit:</label>
                <input
                  type="number"
                  value={newTest.timeLimit}
                  onChange={(e) => setNewTest({ ...newTest, timeLimit: parseInt(e.target.value) || 15 })}
                  min={1}
                  max={120}
                  className="w-20 bg-slate-100 rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-500">minutes</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Questions</p>
                {newTest.questions.map((q, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-3 mb-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Question {idx + 1}</span>
                      {newTest.questions.length > 1 && (
                        <button
                          onClick={() => setNewTest({ ...newTest, questions: newTest.questions.filter((_, i) => i !== idx) })}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      placeholder="Question text"
                      value={q.questionText}
                      onChange={(e) => {
                        const qs = [...newTest.questions];
                        qs[idx].questionText = e.target.value;
                        setNewTest({ ...newTest, questions: qs });
                      }}
                      className="w-full bg-white rounded-lg px-3 py-1.5 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${idx}`}
                            checked={q.correctAnswer === oIdx}
                            onChange={() => {
                              const qs = [...newTest.questions];
                              qs[idx].correctAnswer = oIdx;
                              setNewTest({ ...newTest, questions: qs });
                            }}
                            className="w-4 h-4"
                          />
                          <input
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            value={opt}
                            onChange={(e) => {
                              const qs = [...newTest.questions];
                              qs[idx].options[oIdx] = e.target.value;
                              setNewTest({ ...newTest, questions: qs });
                            }}
                            className="flex-1 bg-white rounded-lg px-2 py-1 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                    <input
                      placeholder="Explanation (optional)"
                      value={q.explanation}
                      onChange={(e) => {
                        const qs = [...newTest.questions];
                        qs[idx].explanation = e.target.value;
                        setNewTest({ ...newTest, questions: qs });
                      }}
                      className="w-full bg-white rounded-lg px-3 py-1.5 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setNewTest({ ...newTest, questions: [...newTest.questions, { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }] })}
                  className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
                >
                  + Add Question
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={createTest} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Create</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeTests;
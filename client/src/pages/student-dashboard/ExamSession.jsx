import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ExamSession = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const paper = state?.paper || { name: "Mathematic Paper 1", time: "2 Hours" };

  const totalSeconds = paper.time.includes("30") ? 5400 : 7200;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [answers, setAnswers] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleMCQ = (qId, option) => {
    setAnswers((p) => ({ ...p, [qId]: option }));
  };

  const handleFill = (qId, value) => {
    setAnswers((p) => ({ ...p, [qId]: value }));
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    alert("Exam submitted! (Demo)");
    navigate("/student/past-questions");
  };

  return (
    <div className="h-full pb-20 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#6b4c7a]">Question in Session</h1>
          <p className="text-sm font-medium text-slate-600 mt-1">{paper.name}</p>
        </div>
        <div className="bg-[#6b4c7a] text-white px-6 py-3 rounded-xl text-xl font-mono font-bold tracking-wider">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-10">
        {/* Section A: Multiple Choice */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4">Section A: Multiple Choice</h3>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">
                <span className="font-bold mr-2">1.</span>
                Which of the following best describes the flow of energy through an ecosystem?
              </p>
              <div className="space-y-2 max-w-md">
                {["Producers → Consumers → Decomposers", "Sun → Plants → Animals", "Heat → Light → Chemical", "Donuts"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleMCQ("q1", opt)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      answers.q1 === opt
                        ? "bg-[#6b4c7a] text-white shadow-md"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Fill in the blanks */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4">Section B: Fill in the blanks</h3>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">
                <span className="font-bold mr-2">2.</span>
                What is the{" "}
                <input
                  type="text"
                  value={answers.q2 || ""}
                  onChange={(e) => handleFill("q2", e.target.value)}
                  placeholder="Essence"
                  className="inline-block w-32 border-b-2 border-[#6b4c7a] bg-transparent text-center text-sm font-bold text-[#6b4c7a] placeholder-[#b89bc8] outline-none px-1 py-0.5 mx-1"
                />{" "}
                of life
              </p>
            </div>
          </div>
        </div>

        {/* Section C: Answer Questions */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4">Section C: Answer Questions</h3>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">
                <span className="font-bold mr-2">3.</span>
                Can humans ever directly see a photon? and Why?
              </p>
              <textarea
                value={answers.q3 || ""}
                onChange={(e) => handleFill("q3", e.target.value)}
                placeholder="Type your answer here..."
                className="w-full max-w-lg h-24 p-3 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-[#c4a8d4] focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-[#6b4c7a] text-white rounded-xl font-bold text-sm hover:bg-[#5a3d68] transition-colors shadow-md"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default ExamSession;
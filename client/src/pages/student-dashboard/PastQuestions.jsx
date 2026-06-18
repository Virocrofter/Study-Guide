import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const pastPapers = {
  2025: [
    { id: "m25p1", name: "Maths - paper 1", time: "2 Hours", subject: "Mathematics" },
    { id: "m25p2", name: "Maths - paper 2", time: "1 Hour 30 mins", subject: "Mathematics" },
  ],
  2024: [
    { id: "m24p1", name: "Maths - paper 1", time: "2 Hours", subject: "Mathematics" },
    { id: "m24p2", name: "Maths - paper 2", time: "1 Hour 30 mins", subject: "Mathematics" },
  ],
};

const PastQuestions = () => {
  const navigate = useNavigate();
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  return (
    <div className="h-full pb-20 max-w-4xl">
      <h1 className="text-4xl font-bold text-[#6b4c7a] mb-6">Mathematics</h1>

      <h2 className="text-lg font-bold text-slate-800 mb-4">Past Papers</h2>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-4 h-4 rounded-full bg-[#c4a8d4]" />
        <button
          onClick={() => setInstructionsOpen(!instructionsOpen)}
          className="flex-1 max-w-lg bg-[#6b4c7a] text-white px-6 py-3 rounded-xl text-sm font-medium flex items-center justify-between hover:bg-[#5a3d68] transition-colors"
        >
          <span>instructions for this set paper</span>
          <svg
            className={`w-4 h-4 transition-transform ${instructionsOpen ? "rotate-90" : ""}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {instructionsOpen && (
        <div className="bg-white rounded-xl border border-[#c4a8d4] p-5 mb-6 text-sm text-slate-600 shadow-sm">
          <p className="mb-2 font-medium text-[#6b4c7a]">Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Answer all questions in the spaces provided.</li>
            <li>Non-programmable calculators may be used.</li>
            <li>Write your name and school on the cover sheet.</li>
            <li>Time management is essential — do not spend too long on one question.</li>
          </ul>
        </div>
      )}

      {Object.entries(pastPapers)
        .sort(([a], [b]) => b - a)
        .map(([year, papers]) => (
          <div key={year} className="mb-8">
            <div className="flex items-center gap-8 border-b border-slate-300 pb-1 mb-3">
              <h3 className="text-lg font-bold text-slate-800">MATHEMATICS - {year}</h3>
              <span className="text-sm font-medium text-slate-500">Time</span>
            </div>

            <div className="space-y-2">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-[#6b4c7a] text-white rounded-xl px-6 py-4 flex items-center justify-between"
                >
                  <span className="font-medium">{paper.name}</span>
                  <div className="flex items-center gap-6">
                    <span className="text-sm opacity-90">{paper.time}</span>
                    <button
                      onClick={() =>
                        navigate("/student/exam-session", {
                          state: { paper, year, mode: "past" },
                        })
                      }
                      className="bg-[#c4a8d4] text-[#6b4c7a] px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#b89bc8] transition-colors"
                    >
                      START
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default PastQuestions;
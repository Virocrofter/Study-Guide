import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const dummyTests = [
  { id: 1, subject: "Biology", topic: "DNA", grade: "Grade 12", type: "Test", questions: 5, score: null },
  { id: 2, subject: "Biology", topic: "DNA", grade: "Grade 12", type: "Test", questions: 5, score: 85 },
  { id: 3, subject: "Biology", topic: "DNA", grade: "Grade 12", type: "Test", questions: 5, score: null },
  { id: 4, subject: "Biology", topic: "DNA", grade: "Grade 11", type: "Quiz", questions: 5, score: 60 },
];

const subjects = ["All", "Mathematics", "Biology", "Physics", "Chemistry", "English"];
const grades = ["All", "Grade 10", "Grade 11", "Grade 12"];
const types = ["All", "Test", "Quiz", "Exam"];
const topics = ["All", "DNA", "Algebra", "Mechanics", "Organic", "Poetry"];

const Questions = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ subject: "All", grade: "All", type: "All", topic: "All" });

  const filtered = dummyTests.filter((t) => {
    return (
      (filters.subject === "All" || t.subject === filters.subject) &&
      (filters.grade === "All" || t.grade === filters.grade) &&
      (filters.type === "All" || t.type === filters.type) &&
      (filters.topic === "All" || t.topic === filters.topic)
    );
  });

  return (
    <div className="h-full pb-20 max-w-6xl">
      <h1 className="text-3xl font-bold text-[#6b4c7a] mb-2">
        What Questions do you want to practice today?
      </h1>

      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { label: "Subject", key: "subject", options: subjects },
          { label: "Grade", key: "grade", options: grades },
          { label: "Type", key: "type", options: types },
          { label: "Topic", key: "topic", options: topics },
        ].map((f) => (
          <div key={f.key} className="relative">
            <select
              value={filters[f.key]}
              onChange={(e) => setFilters((p) => ({ ...p, [f.key]: e.target.value }))}
              className="appearance-none bg-[#6b4c7a] text-white pl-4 pr-10 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#5a3d68] transition-colors outline-none"
            >
              {f.options.map((o) => (
                <option key={o} value={o} className="bg-white text-slate-800">
                  {o}
                </option>
              ))}
            </select>
            <svg
              className="w-4 h-4 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-2xl border border-[#c4a8d4] p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-[#c4a8d4] rounded-xl px-4 py-2 flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-[#6b4c7a]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm font-medium text-[#6b4c7a]">
                Score: {test.score !== null ? `${test.score}%` : "—"}
              </span>
            </div>

            <h3 className="font-bold text-slate-800 mb-1">
              {test.subject}: {test.topic} - {test.type}
            </h3>
            <span className="inline-block bg-[#c4a8d4] text-[#6b4c7a] text-xs font-bold px-3 py-1.5 rounded-lg mb-4">
              {test.questions} Questions
            </span>

            <button
              onClick={() => navigate("/student/exam-session", { state: { test } })}
              className="w-full py-2.5 bg-[#c4a8d4] text-[#6b4c7a] font-bold rounded-xl hover:bg-[#b89bc8] transition-colors shadow-sm"
            >
              Start
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p>No practice questions match your filters.</p>
        </div>
      )}
    </div>
  );
};

export default Questions;
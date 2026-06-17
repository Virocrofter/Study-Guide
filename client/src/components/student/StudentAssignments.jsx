import React from "react";

const StudentAssignments = () => {
  return (
    <div className="h-full pb-20 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
        <p className="text-slate-500 mt-1">Track your coursework and deadlines.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Coming Soon</h3>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          Assignments and quizzes will appear here once your educators start publishing them. Check back later!
        </p>
        <div className="flex justify-center gap-3">
          <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">Quizzes</span>
          <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">Projects</span>
          <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">Deadlines</span>
        </div>
      </div>

      {/* Mock placeholder for future assignments */}
      <div className="mt-8 grid md:grid-cols-2 gap-4 opacity-50">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 uppercase">Submitted</span>
          </div>
          <h4 className="font-bold text-slate-800">JavaScript Basics Quiz</h4>
          <p className="text-sm text-slate-500 mt-1">Due Oct 24 • 10 questions</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-700 uppercase">Pending</span>
          </div>
          <h4 className="font-bold text-slate-800">React Component Project</h4>
          <p className="text-sm text-slate-500 mt-1">Due Nov 2 • 1 submission</p>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
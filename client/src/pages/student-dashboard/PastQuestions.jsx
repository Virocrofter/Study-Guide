import React from "react";

const PastQuestions = () => {
  return (
    <div className="h-full pb-20 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Past Questions</h1>
        <p className="text-slate-500 mt-1">Review questions you have previously attempted.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No history yet</h3>
        <p className="text-slate-400">Your past attempts will be saved here.</p>
      </div>
    </div>
  );
};

export default PastQuestions;
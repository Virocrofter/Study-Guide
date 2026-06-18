import React from "react";

const HallOfFame = () => {
  return (
    <div className="h-full pb-20 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Hall of Fame</h1>
        <p className="text-slate-500 mt-1">Top performers and achievement leaders.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Hall of Fame</h3>
        <p className="text-slate-400">Leaderboard data will appear here.</p>
      </div>
    </div>
  );
};

export default HallOfFame;
import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const ForEducators = () => {
  const { becomeEducator } = useContext(AppContext);
  const leftRef = useScrollReveal();
  const rightRef = useScrollReveal();

  return (
    <section className="py-20 md:px-40 px-8 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16">
        <div ref={leftRef} className="reveal-left flex-1">
          <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4">
            For Educators
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Share Your Expertise. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
              Build Your Brand.
            </span>
          </h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-lg">
            Join 120+ educators already earning on StudyGuide. Create courses, 
            track student progress, and grow your audience with our powerful tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              onClick={becomeEducator}
              className="px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Teaching Today
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold text-white">$0</p>
              <p className="text-sm text-slate-400">Setup Cost</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">85%</p>
              <p className="text-sm text-slate-400">Revenue Share</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">50K+</p>
              <p className="text-sm text-slate-400">Active Learners</p>
            </div>
          </div>
        </div>

        <div ref={rightRef} className="reveal-left delay-200 flex-1 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800">
            <div className="bg-slate-800 p-4 rounded-t-2xl border-b border-slate-700 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <p className="text-sm text-slate-400">Educator Dashboard</p>
            </div>
            <div className="bg-slate-800/50 p-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Total Courses</p>
                    <p className="text-xs text-slate-400">12 Published</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-white">12</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Total Earnings</p>
                    <p className="text-xs text-slate-400">This month</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-400">$4,250</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Students</p>
                    <p className="text-xs text-slate-400">1,240 enrolled</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-white">1.2K</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForEducators;
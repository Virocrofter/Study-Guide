import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import Searchbar from "./Searchbar";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const Hero = () => {
  const { allCourses } = useContext(AppContext);
  const statsRef = useScrollReveal();

  return (
    <div className="relative w-full bg-slate-900 text-white overflow-hidden">
      {/* Simple gradient - no blur, no complex patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
      
      {/* Soft glow orbs - pure color, no blur filter */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full md:pt-28 pt-20 pb-16 px-7 md:px-0 text-center">
        {/* Badge */}
        <div className="reveal-up revealed inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
          <span className="text-sm font-medium text-cyan-100">
            Over {allCourses?.length || "100"}+ courses available
          </span>
        </div>

        {/* Headline */}
        <h1 className="reveal-up revealed delay-100 text-4xl md:text-6xl font-bold max-w-5xl mx-auto leading-tight mb-6">
          Master New Skills with{" "}
          <span className="text-gradient">
            World-Class
          </span>{" "}
          Educators
        </h1>

        {/* Subheadline */}
        <p className="reveal-up revealed delay-200 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Interactive courses designed by industry experts. Learn at your own pace, 
          track your progress, and earn certificates that matter.
        </p>

        {/* Search */}
        <div className="reveal-up revealed delay-300 w-full max-w-2xl mx-auto mb-12">
          <Searchbar />
        </div>

        {/* Stats Row */}
        <div ref={statsRef} className="reveal-up flex flex-wrap justify-center gap-8 md:gap-16 text-center">
          <div className="delay-100">
            <p className="text-3xl md:text-4xl font-bold text-white">50K+</p>
            <p className="text-sm text-slate-400 mt-1">Active Learners</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div className="delay-200">
            <p className="text-3xl md:text-4xl font-bold text-white">200+</p>
            <p className="text-sm text-slate-400 mt-1">Expert Courses</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div className="delay-300">
            <p className="text-3xl md:text-4xl font-bold text-white">4.9</p>
            <p className="text-sm text-slate-400 mt-1">Average Rating</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div className="delay-400">
            <p className="text-3xl md:text-4xl font-bold text-white">120+</p>
            <p className="text-sm text-slate-400 mt-1">Top Educators</p>
          </div>
        </div>

        {/* Floating Cards - NO backdrop-filter, just semi-transparent bg */}
        <div className="absolute left-4 md:left-20 top-1/3 bg-white/90 rounded-xl p-4 hidden lg:block animate-float-safe shadow-lg border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
              JS
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800">JavaScript Mastery</p>
              <p className="text-xs text-slate-500">Just enrolled!</p>
            </div>
          </div>
        </div>

        <div className="absolute right-4 md:right-20 top-1/2 bg-white/90 rounded-xl p-4 hidden lg:block animate-float-safe shadow-lg border border-white/20" style={{ animationDelay: "2.5s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              UX
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800">UI/UX Design</p>
              <p className="text-xs text-green-600 font-medium">★ 4.9 Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Curve */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#ffffff"/>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
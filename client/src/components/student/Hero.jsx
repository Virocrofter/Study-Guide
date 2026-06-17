import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import Searchbar from "./Searchbar";

const Hero = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <div className="relative w-full bg-slate-900 text-white overflow-hidden">
      {/* Simple gradient background - NO blur, NO grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full md:pt-28 pt-20 pb-16 px-7 md:px-0 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
          <span className="text-sm font-medium text-cyan-100">
            Over {allCourses?.length || "100"}+ courses available
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold max-w-5xl mx-auto leading-tight mb-6">
          Master New Skills with{" "}
          <span className="text-gradient bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            World-Class
          </span>{" "}
          Educators
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Interactive courses designed by industry experts. Learn at your own pace, 
          track your progress, and earn certificates that matter.
        </p>

        {/* Search */}
        <div className="w-full max-w-2xl mx-auto mb-12">
          <Searchbar />
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">50K+</p>
            <p className="text-sm text-slate-400 mt-1">Active Learners</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">200+</p>
            <p className="text-sm text-slate-400 mt-1">Expert Courses</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">4.9</p>
            <p className="text-sm text-slate-400 mt-1">Average Rating</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">120+</p>
            <p className="text-sm text-slate-400 mt-1">Top Educators</p>
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
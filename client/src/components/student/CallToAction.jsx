import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const CallToAction = () => {
  const { navigate } = useContext(AppContext);
  const ref = useScrollReveal();

  return (
    <section className="py-20 md:px-40 px-8">
      <div ref={ref} className="reveal-scale max-w-5xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-12 md:p-16 text-center">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
            Join thousands of students already advancing their careers. 
            Get unlimited access to all courses with one simple enrollment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/course-list")}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Explore Courses
            </button>
            <button
              onClick={() => navigate("/about")}
              className="px-8 py-4 bg-white/10 text-white border border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
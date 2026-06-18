import React from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const steps = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Discover",
    desc: "Browse 200+ courses across tech, design, business, and more. Filter by skill level and topic.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Enroll",
    desc: "One-click enrollment with secure Stripe payments. Lifetime access with all future updates included.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Learn & Grow",
    desc: "Track progress lecture-by-lecture. Earn certificates and showcase your new skills to employers.",
    color: "from-emerald-500 to-teal-400",
  },
];

const HowItWorks = () => {
  const headerRef = useScrollReveal();

  return (
    <section className="py-20 md:px-40 px-8 bg-white">
      <div ref={headerRef} className="reveal-up max-w-6xl mx-auto text-center mb-16">
        <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">
          How It Works
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          Your Learning Journey in <span className="text-gradient">3 Steps</span>
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="reveal-up hover-lift group p-8 rounded-2xl bg-slate-50 border border-slate-100"
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
              {step.icon}
            </div>
            <div className="absolute top-8 right-8 text-6xl font-bold text-slate-100 group-hover:text-blue-100 transition-colors">
              0{index + 1}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
            <p className="text-slate-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
import React from "react";
import { dummyTestimonial } from "../../assets/assets";

const TestinonialSection = () => {
  return (
    <section className="py-20 md:px-40 px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Loved by <span className="text-gradient">50,000+</span> Learners
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Hear from our community about how StudyGuide transformed their careers and helped them master new skills.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {dummyTestimonial.slice(0, 3).map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(testimonial.rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed italic">
                "{testimonial.feedback}"
              </p>
              <div className="flex items-center gap-4">
                <img
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div>
                  <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestinonialSection;
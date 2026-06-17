import React, { useEffect } from 'react'
import Hero from '../../components/student/Hero'
import Companies from '../../components/student/Companies'
import CourseSections from '../../components/student/CourseSections'
import HowItWorks from '../../components/student/HowItWorks'
import ForEducators from '../../components/student/ForEducators'
import TestinonialSection from '../../components/student/TestinonialSection'
import CallToAction from '../../components/student/CallToAction'
import Footer from '../../components/student/Footer'

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-section').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className='flex flex-col items-center bg-white'>
      <Hero />
      <Companies />
      <div className="reveal-section w-full"><CourseSections /></div>
      <div className="reveal-section w-full"><HowItWorks /></div>
      <div className="reveal-section w-full"><ForEducators /></div>
      <div className="reveal-section w-full"><TestinonialSection /></div>
      <div className="reveal-section w-full"><CallToAction /></div>
      <Footer />
    </div>
  )
}

export default Home
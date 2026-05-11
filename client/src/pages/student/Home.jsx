import React from 'react'
import Hero from '../../components/student/Hero'
import Companies from '../../components/student/Companies'
import CourseSections from '../../components/student/CourseSections'
import TestinonialSection from '../../components/student/TestinonialSection'
import CallToAction from '../../components/student/CallToAction'
import Footer from '../../components/student/Footer'

const Home = () => {
  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
        <Hero />
        <Companies />
        <CourseSections />
        <TestinonialSection />
        <CallToAction />
        <Footer />
    </div>
  )
}

export default Home
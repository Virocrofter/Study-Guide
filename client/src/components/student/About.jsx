import React from "react";
import Footer from "../../components/student/Footer";

const About = () => {
  return (
    <>
      <div className="md:px-36 px-8 pt-20 pb-16 text-gray-700">
        <h1 className="text-4xl font-semibold text-gray-900">About us</h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          Welcome to StudyGuide. We help students learn faster with structured courses and progress
          tracking.
        </p>
      </div>
      <Footer />
    </>
  );
};

export default About;


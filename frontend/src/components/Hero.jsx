import React from "react";
import { Search } from "lucide-react";

const Hero = () => {
  return (
    <section className="bg-green-900 text-white py-16 px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between">
      {/* Left Section - Text Content */}
      <div className="max-w-xl">
        <h2 className="text-lg tracking-widest font-semibold">KNOWLEDGEPULSE</h2>
        <h1 className="text-4xl md:text-5xl font-bold mt-4">
          Knowledge Meets <br /> Innovation
        </h1>
        <p className="text-lg mt-4 text-gray-200">
          This platform's simplicity belies its powerful capabilities, offering
          a seamless and enjoyable educational experience.
        </p>

        {/* Search Bar */}
        <div className="mt-6 flex items-center bg-white p-2 rounded-lg shadow-md w-full md:w-96">
          <Search className="text-gray-500 mx-3" size={20} />
          <input
            type="text"
            placeholder="Search Courses"
            className="w-full px-2 py-2 text-gray-900 outline-none"
          />
          <button className="bg-gray-100 px-4 py-2 rounded-lg text-gray-800">
            Courses
          </button>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="relative mt-10 md:mt-0">
        <div className="absolute top-6 -left-4 bg-yellow-400 rounded-full w-24 h-24 opacity-80 -z-10"></div>
        <img
          src="/student.png" 
          alt="Student"
          className="w-80 md:w-96 lg:w-[400px] rounded-lg shadow-lg"
        />
      </div>
    </section>
  );
};

export default Hero;

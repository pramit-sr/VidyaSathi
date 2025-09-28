import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";
import Navbar from "./Navbar"; // ✅ Existing Navbar

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`, {
          withCredentials: true,
        });
        setCourses(response.data.courses);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching courses: ", error);
        toast.error("Failed to load courses.");
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="w-[85%] mx-auto mt-10">
        {/* Heading with My Purchases Button */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-green-700">Courses</h2>
          <Link
            to="/purchases"
            className="bg-green-100 text-green-700 border border-green-500 px-5 py-2 rounded-full hover:bg-green-200 transition duration-300 font-medium text-sm shadow-sm"
          >
            My Purchases
          </Link>
        </div>

        {/* Course Cards */}
        <div className="overflow-y-auto max-h-[75vh]">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-500">No courses available yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white border border-gray-100 shadow-md rounded-2xl overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl duration-300"
                >
                  <img
                    src={course.image.url}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {course.description.length > 100
                        ? `${course.description.slice(0, 100)}...`
                        : course.description}
                    </p>
                    <div className="flex justify-between items-center text-sm mb-4">
                      <div className="text-green-700 font-bold">
                        ₹{course.price}
                        <span className="text-gray-400 line-through text-xs ml-2">₹5999</span>
                      </div>
                      <div className="text-green-500 font-medium">20% off</div>
                    </div>
                    <Link
                      to={`/buy/${course._id}`}
                      className="block w-full text-center bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition duration-300 text-sm font-medium"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Courses;

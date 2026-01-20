import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";
import Navbar from "./Navbar";

function QuizHome() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/course/courses`, {
        withCredentials: true,
      });
      setCourses(response.data.courses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
      setLoading(false);
    }
  };

  const handleCourseSelect = async (courseId) => {
    setSelectedCourse(courseId);
    setTopicsLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/topic/course/${courseId}`,
        {
          withCredentials: true,
        }
      );
      setTopics(response.data.topics || []);
      if (!response.data.topics || response.data.topics.length === 0) {
        // Don't show error for empty topics - it's normal if no topics exist yet
        console.log("No topics found for this course");
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      // Only show error if it's a real error (not 404 or empty)
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.error || "Failed to load topics");
      }
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-[90%] max-w-6xl mx-auto mt-10 pb-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-green-700 mb-6">
            Quiz Generator
          </h1>
          <p className="text-gray-600 mb-8">
            Select a course to view its topics and generate quizzes
          </p>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading courses...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Course Selection */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Select a Course
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {courses.length === 0 ? (
                    <p className="text-gray-500">No courses available</p>
                  ) : (
                    courses.map((course) => (
                      <button
                        key={course._id}
                        onClick={() => handleCourseSelect(course._id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedCourse === course._id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300 bg-white"
                        }`}
                      >
                        <h3 className="font-semibold text-gray-800">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {course.description.length > 80
                            ? `${course.description.slice(0, 80)}...`
                            : course.description}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Topics List */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Topics
                </h2>
                {!selectedCourse ? (
                  <div className="p-8 text-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      Please select a course to view topics
                    </p>
                  </div>
                ) : topicsLoading ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">Loading topics...</p>
                  </div>
                ) : topics.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">
                      No topics available for this course
                    </p>
                    <p className="text-sm text-gray-400">
                      Contact your admin to add topics
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {topics.map((topic) => (
                      <Link
                        key={topic._id}
                        to={`/quiz/${topic._id}`}
                        className="block p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 bg-white hover:bg-green-50 transition-all"
                      >
                        <h3 className="font-semibold text-gray-800">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {topic.description}
                        </p>
                        <div className="mt-3">
                          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            Generate Quiz →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizHome;

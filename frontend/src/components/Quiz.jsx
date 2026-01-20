import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "../utils/utils";
import QuizDisplay from "./QuizDisplay";
import Navbar from "./Navbar";

function Quiz() {
  const { topicId } = useParams();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [topic, setTopic] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    // Fetch topic details if topicId is provided
    if (topicId) {
      fetchTopicDetails();
      checkExistingQuiz();
    }
  }, [topicId]);

  const fetchTopicDetails = async () => {
    if (!topicId) return;

    try {
      const response = await axios.get(
        `${BACKEND_URL}/topic/${topicId}`,
        {
          withCredentials: true,
        }
      );
      if (response.data.topic) {
        setTopic(response.data.topic);
      }
    } catch (error) {
      console.error("Error fetching topic:", error);
      toast.error("Failed to load topic details");
    }
  };

  const checkExistingQuiz = async () => {
    if (!token || !topicId) return;

    try {
      const response = await axios.get(
        `${BACKEND_URL}/quiz/topic/${topicId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.data.quiz) {
        setQuiz(response.data.quiz);
      }
    } catch (error) {
      // Quiz doesn't exist yet, which is fine
      console.log("No existing quiz found");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!token || !topicId) {
      toast.error("Please login to generate quiz");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/quiz/generate/${topicId}`,
        { numQuestions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Quiz generated successfully!");
      setQuiz(response.data.quiz);
    } catch (error) {
      console.error("Error generating quiz:", error);
      const errorMessage =
        error?.response?.data?.error || "Failed to generate quiz";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmitted = () => {
    // Refresh quiz or navigate away
    setQuiz(null);
    toast.success("Quiz submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-[90%] max-w-4xl mx-auto mt-10 pb-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-green-700 mb-6">
            Quiz Generator
          </h1>

          {topic && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                {topic.title}
              </h2>
              <p className="text-gray-600">{topic.description}</p>
            </div>
          )}

          {!quiz ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={loading || !topicId}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating Quiz...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </button>

              {!topicId && (
                <p className="text-red-500 text-sm mt-2">
                  Please provide a topic ID to generate quiz
                </p>
              )}
            </div>
          ) : (
            <QuizDisplay
              quiz={quiz}
              topicId={topicId}
              onQuizSubmitted={handleQuizSubmitted}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;

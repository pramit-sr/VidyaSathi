import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../utils/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

const Analytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [explainingTopic, setExplainingTopic] = useState(null);
  const [explanation, setExplanation] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    if (token) {
      fetchAnalytics();
      fetchWeakTopics();
      fetchRecommendations();
    }
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setAnalytics(response.data.analytics);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeakTopics = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/weak-topics`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setWeakTopics(response.data.weakTopics);
    } catch (error) {
      console.error("Error fetching weak topics:", error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/user/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const handleExplainTopic = async (topicId) => {
    setExplainingTopic(topicId);
    setExplanation(null);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/user/explain-topic/${topicId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setExplanation(response.data);
    } catch (error) {
      console.error("Error explaining topic:", error);
      toast.error("Failed to generate explanation");
    } finally {
      setExplainingTopic(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Quizzes</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalQuizzes || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Weak Topics</h3>
            <p className="text-3xl font-bold text-red-600">{stats.weakTopicsCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Overall Accuracy</h3>
            <p className="text-3xl font-bold text-green-600">{stats.overallAccuracy || 0}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Topic Accuracy</h2>
            {analytics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics}>
                  <XAxis dataKey="topic" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No quiz data available. Take some quizzes to see your progress!
              </div>
            )}
          </div>

          {/* Weak Topics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Weak Topics 🔴</h2>
            {weakTopics.length > 0 ? (
              <div className="space-y-3">
                {weakTopics.map((topic) => (
                  <div
                    key={topic.topicId}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{topic.topicTitle}</p>
                      <p className="text-sm text-gray-600">Average Score: {topic.averageScore}%</p>
                    </div>
                    <button
                      onClick={() => handleExplainTopic(topic.topicId)}
                      disabled={explainingTopic === topic.topicId}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {explainingTopic === topic.topicId ? "Generating..." : "Explain"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Great job! No weak topics. Keep up the good work! 🎉
              </div>
            )}
          </div>
        </div>

        {/* AI Explanation Modal */}
        {explanation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  AI Explanation: {explanation.topicTitle}
                </h3>
                <button
                  onClick={() => setExplanation(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{explanation.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📌 Recommended Next Steps</h2>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-700 whitespace-pre-wrap">{recommendations.recommendations}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

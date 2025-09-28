import React, { useState } from "react";
import logo from "../../public/logo.webp";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BACKEND_URL}/admin/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(response.data.message);
      localStorage.setItem("admin", JSON.stringify(response.data));
      navigate("/admin/dashboard");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.errors || "Admin login failed!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-green-950 text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-5">
        <div className="flex items-center space-x-2">
          {/* <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" /> */}
          <Link to="/" className="text-xl font-bold text-green-400">
            KnowledgePlus
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/signup"
            className="bg-transparent border border-gray-500 py-2 px-4 rounded-md"
          >
            Signup
          </Link>
          {/* <Link
            to="/courses"
            className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded-md"
          >
            Join now
          </Link> */}
        </div>
      </header>

      {/* Admin Login Form */}
      <div className="h-screen container mx-auto flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md mt-20">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Welcome to <span className="text-green-500">CourseHaven</span>
          </h2>
          <p className="text-center text-gray-400 mb-6">
            Log in to access the admin dashboard!
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {errorMessage && (
              <div className="mb-4 text-red-500 text-center">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-md transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

import React from "react";
import { Link } from "react-router-dom";
import logo from "../../public/logo.webp";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_URL } from "../utils/utils";

function Dashboard() {
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/logout`, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      localStorage.removeItem("admin");
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response?.data?.errors || "Error in logging out");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-[80%] mx-auto">

        {/* Navbar */}
        <nav className="bg-white-100 shadow-md px-4 py-4 flex items-center justify-between relative">
          <div className="flex items-center space-x-3">
            {/* <img src={logo} alt="Logo" className="h-10 w-10 rounded-full" /> */}
            <h1 className="text-xl font-bold text-green-700">Admin Panel</h1>
          </div>

          {/* Center Nav */}
          <ul className="absolute left-1/2 transform -translate-x-1/2 flex gap-6">
            <li>
              <Link
                to="/admin/our-courses"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Our Courses
              </Link>
            </li>
            <li>
              <Link
                to="/admin/create-course"
                className="text-gray-700 hover:text-orange-500 font-medium"
              >
                Create Course
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="text-gray-700 hover:text-red-500 font-medium"
              >
                Home
              </Link>
            </li>
          </ul>

          {/* Logout */}
          <div>
            <Link to="/admin/login">
              <button
                onClick={handleLogout}
                className="bg-green-700 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Logout
              </button>
            </Link>
          </div>
        </nav>

        {/* Main Welcome Section */}
        <main className="flex justify-center items-center h-[80vh]">
          <div className="text-center">
            {/* <img
              src={logo}
              alt="Admin"
              className="h-28 w-28 rounded-full mx-auto mb-4"
            /> */}
            <h2 className="text-2xl font-bold text-green-700">Welcome, Admin!</h2>
            <p className="text-gray-600 mt-2">Manage your platform with ease.</p>
          </div>
        </main>

      </div>
    </div>
  );
}

export default Dashboard;

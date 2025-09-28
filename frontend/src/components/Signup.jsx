import React, { useState } from "react";
import logo from "../../public/logo.webp";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${BACKEND_URL}/user/signup`,
        { firstName, lastName, email, password },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      console.log("Signup successful:", response.data);
      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Error response:", error.response);
      setErrorMessage(error.response?.data?.message || "Signup failed!!!");
    }
  };

  return (
    <div className="bg-gradient-to-r from-black to-green-950 min-h-screen flex flex-col items-center justify-center text-white">
      {/* Signup Form */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-5">
              <div className="flex items-center space-x-2">
                {/* <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" /> */}
                <Link to="/" className="text-xl font-bold text-green-400">
                  KnowledgePlus
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {/* <Link
                  to="/admin/signup"
                  className="bg-transparent border border-gray-500 py-2 px-4 rounded-md"
                >
                  Signup
                </Link> */}
                {/* <Link
                  to="/courses"
                  className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded-md"
                >
                  Join now
                </Link> */}
              </div>
            </header>
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-[500px]">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Join <span className="text-green-500">Knowledgeplus</span> Today!
        </h2>
        <p className="text-center text-gray-400 mb-4">Create an account to start learning.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstname" className="text-gray-400 mb-2">First Name</label>
            <input
              type="text"
              id="firstname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="lastname" className="text-gray-400 mb-2">Last Name</label>
            <input
              type="text"
              id="lastname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="text-gray-400 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="name@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="text-gray-400 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {errorMessage && (
            <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-md transition mt-4"
          >
            Sign Up
          </button>
        </form>

        <p className="text-xs text-center mt-4 text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-green-400 hover:text-green-300">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;

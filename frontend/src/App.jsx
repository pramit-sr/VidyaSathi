import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { Toaster } from "react-hot-toast";
import Purchases from "./components/Purchases";
import Buy from "./components/Buy";
import Courses from "./components/Courses";
import AdminSignup from "./admin/AdminSignup";
import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/Dashboard";
import CourseCreate from "./admin/CourseCreate";
import UpdateCourse from "./admin/UpdateCourse";
import OurCourses from "./admin/OurCourses";
import TopicCreate from "./admin/TopicCreate";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Quiz from "./components/Quiz";
import QuizHome from "./components/QuizHome";
import Analytics from "./components/Analytics";

function App() {
  return (
    <div>
      <Toaster />
      <AppContent />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const admin = JSON.parse(localStorage.getItem("admin"));

  // Hide Navbar, Hero, and Footer on Login, Signup, and Admin-related pages
 const hideElementsPaths = [
  "/login",
  "/signup",
  "/admin/signup",
  "/admin/login",
  "/admin/dashboard",
  "/admin/create-course",
  "/admin/update-course",
  "/admin/our-courses",
  "/courses",
  "/purchases",
  "/buy/",
  "/quiz",
  "/analytics",
];

const hideElements = hideElementsPaths.some(path => location.pathname.startsWith(path));

 


  
  return (
    <>
      {!hideElements && <Navbar />}
      {!hideElements && <Hero />}
      
      <Routes>
        {/* User Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/buy/:courseId" element={<Buy />} />
        <Route path="/purchases" element={user ? <Purchases /> : <Navigate to={"/login"} />} />
        <Route path="/quiz" element={user ? <QuizHome /> : <Navigate to={"/login"} />} />
        <Route path="/quiz/:topicId" element={user ? <Quiz /> : <Navigate to={"/login"} />} />
        <Route path="/analytics" element={user ? <Analytics /> : <Navigate to={"/login"} />} />

        {/* Admin Routes */}
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={admin ? <Dashboard /> : <Navigate to={"/admin/login"} />} />
        <Route path="/admin/create-course" element={<CourseCreate />} />
        <Route path="/admin/create-topic" element={admin ? <TopicCreate /> : <Navigate to={"/admin/login"} />} />
        <Route path="/admin/update-course/:id" element={<UpdateCourse />} />
        <Route path="/admin/our-courses" element={<OurCourses />} />
      </Routes>

      {!hideElements && <Footer />}
    </>
  );
}

export default App;

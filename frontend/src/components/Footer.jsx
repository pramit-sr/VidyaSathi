import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white shadow-md py-8 px-6 md:px-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand Section */}
        <div className="flex flex-col items-center md:items-start">
          <Link to="/" className="text-2xl font-bold text-green-700">
            KnowledgePulse
          </Link>
          <p className="mt-2 text-gray-600 text-center md:text-left">
            Empowering education with innovation.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Quick Links</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link to="/courses" className="hover:text-green-700 transition">
                Courses
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-green-700 transition">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-green-700 transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media & Legal Section */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-green-700 transition">
              <FaFacebook size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-green-700 transition">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-green-700 transition">
              <FaTwitter size={20} />
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            &copy; 2025 KnowledgePulse. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

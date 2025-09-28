import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const Navbar = () => {
  const [search, setSearch] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated (stored in localStorage)
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data
    setIsAuthenticated(false);
    navigate("/"); // Redirect to login page
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 md:px-10 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-green-700">
        KnowledgePulse
      </Link>

      {/* Search Bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses"
          className="w-96 px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <Search className="absolute right-3 text-gray-500" size={18} />
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/courses" className="text-gray-700 hover:text-green-700">
          Courses
        </Link>
        <Link to="/pages" className="text-gray-700 hover:text-green-700">
          Pages
        </Link>
        <Link to="/about" className="text-gray-700 hover:text-green-700">
          About
        </Link>

        {/* Sign In / Log Out Button */}
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Log Out
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

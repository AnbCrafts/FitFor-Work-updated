import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Dropdown from "./Dropdown";
import Logo from "../../Global/Components/Logo";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { Bell } from "lucide-react";
import { assets } from "../assets/assets";
import NavPagesDropdown from "./NavPageDropdown";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Destructure constants from Context
  const { 
    isLoggedIn, 
    user, 
    logout, // Ensure you use the 'logout' name we defined in the Context refactor
    checkAuthStatus,
    loading 
  } = useContext(WorkContext);

  const [navPath, setNavPath] = useState("");

  // 1. Verify Auth on mount
  useEffect(() => {
    
    checkAuthStatus();
  }, []);

  // 2. Synchronize navPath whenever the user object changes
  useEffect(() => {
    if (isLoggedIn && user) {
      const rolePath = user.role?.toLowerCase();
      const userName = user.username;
      setNavPath(`auth/${rolePath}/${userName}`);
    } else {
      setNavPath("");
    }
  }, [isLoggedIn, user]);

  // Logout handler
  const handleLogout = async () => {
    const success = await logout();
    if (success) navigate("/");
  };

  // Guard: If the app is still fetching the user from the cookie, 
  // show a skeleton or return null to prevent 'undefined' flickers.
  if (loading) return <nav className="w-[90%] mx-auto py-6" />; 

  return (
    <nav className="w-[90%] mx-auto py-4 flex items-center justify-start gap-5">
      {/* 1. Logo Section */}
      <Logo path={"/"+navPath || "/"} />

      {/* 2. Home/Pages Dropdown */}
      <NavPagesDropdown basePath={navPath} />

      {/* 3. Find Jobs Dropdown - All paths now prefixed with navPath */}
      <Dropdown
        Links={[
          { label: "Find Jobs", slug: `${navPath}/jobs` },
          { label: "Companies", slug: `${navPath}/companies` },
          { label: "Saved Jobs", slug: `${navPath}/saved-jobs` },
          { label: "My Applications", slug: `${navPath}/my-applications` },
          { label: "Resume Builder", slug: `${navPath}/resume-builder` },
        ]}
        def={{ label: "Find Jobs", slug: `${navPath}/jobs` }}
      />

      {/* 4. AI Tools Dropdown */}
      <Dropdown
        Links={[
          { label: "Resume Enhancer", slug: `${navPath}/resume-enhancer` },
          { label: "Cover Letter", slug: `${navPath}/generate/cover-letter` },
          { label: "Smart Matches", slug: `${navPath}/smart-job-recommendations` },
        ]}
        def={{ label: "AI Tools", slug: `${navPath}/resume-enhancer` }}
      />

      <div className="flex-1 items-center gap-3 flex justify-end">
        {/* Notification Bell */}
        {isLoggedIn && user && (
          <Link
            to={`/${navPath}/notification`}
            className="p-2 bg-purple-100 rounded-full relative hover:bg-purple-200 transition"
          >
            <Bell className="h-5 w-5 text-purple-700" />
            <span className="absolute top-1 right-1 bg-red-500 h-2.5 w-2.5 rounded-full" />
          </Link>
        )}

        {/* --- PROFILE DROPDOWN (ME) --- */}
        {isLoggedIn && user ? (
          <div className="relative group">
            {/* The Trigger Card - No more 'undefined' thanks to user check */}
            <div className="flex items-center gap-3 border border-gray-200 bg-white px-4 py-1.5 rounded-xl shadow-sm group-hover:border-purple-500 transition cursor-pointer">
              <p className="text-gray-700 font-medium">
                {user.firstName || user.username}
              </p>
              <img
                src={user.picture || assets.body3_img}
                className="h-10 w-10 rounded-full object-cover border-2 border-purple-500"
                alt="avatar"
              />
            </div>

            {/* The Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link
                to={`/${navPath}/profile`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
              >
                My Profile
              </Link>
              <Link
                to={`/${navPath}/dashboard`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
              >
                Dashboard
              </Link>
              <Link
                to={`/${navPath}/settings`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
              >
                Settings
              </Link>
              
              <hr className="my-1 border-gray-100" />
              
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          /* Login Button - Shows only when completely logged out */
          <Link
            to="/enroll"
            className="px-5 py-2 rounded-lg border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition font-medium"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
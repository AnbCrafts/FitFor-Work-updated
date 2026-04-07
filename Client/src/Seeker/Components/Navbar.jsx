import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Dropdown from "./Dropdown";
import Logo from "../../Global/Components/Logo";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { Bell } from "lucide-react";
import { assets } from "../assets/assets";
import NavPagesDropdown from "./NavPageDropdown";

const Navbar = () => {
  const location = useLocation();
  const { role, username } = useParams(); 

  // Pulling the correct states from our finalized Context
  const { 
    isLoggedIn, 
    user, 
    exitFromPlatform ,
    checkAuthStatus
  } = useContext(WorkContext);

  const [navPath, setNavPath] = useState("");

  useEffect(()=>{
    checkAuthStatus();
  },[])

  /* CRITICAL FIX: Set the dynamic path using the 'user' object 
     retrieved from the cookie, not the URL params which can be unstable.
  */
  useEffect(() => {
    if (isLoggedIn && user) {
      const rolePath = user.role?.toLowerCase();
      const userName = user.username;
      setNavPath(`/auth/${rolePath}/${userName}`);
    } else {
      setNavPath("");
    }
  }, [isLoggedIn, user]);

  // Logout handler to be passed to the "Me" dropdown
  const handleLogout = () => {
    exitFromPlatform();
  };

  return (
    <nav className="w-[90%] mx-auto py-4 flex items-center justify-start gap-5">
      {/* 1. Logo Section */}
      <Logo path={navPath || "/"} />

      {/* 2. Home/Pages Dropdown (Dropdown #1) */}
      <NavPagesDropdown />

      {/* 3. Find Jobs Dropdown (Dropdown #2) */}
      <Dropdown
        Links={[
          { label: "Find Jobs", slug: "jobs" },
          { label: "Companies", slug: "companies" },
          { label: "Saved Jobs", slug: "saved-jobs" },
          { label: "My Applications", slug: "my-applications" },
          { label: "Resume Builder", slug: "resume-builder" },
          { label: "Career Advice", slug: "career-advice" },
        ]}
        def={{ label: "Find Jobs", slug: "jobs" }}
      />

      {/* 4. AI Tools Dropdown (Dropdown #3) */}
      <Dropdown
        Links={[
          { label: "Resume Enhancer", slug: "resume-enhancer" },
          { label: "Cover Letter Generator", slug: "generate/cover-letter" },
          { label: "Smart Recommendations", slug: "smart-job-recommendations" },
        ]}
        def={{ label: "AI Tools", slug: "resume-enhancer" }}
      />

      {/* 5. User "Me" Dropdown (Dropdown #4) */}
      {/* This only shows if logged in. 
          The 'Logout' slug should trigger exitFromPlatform in your Dropdown component logic.
      */}
      <Dropdown
        Links={[
          { label: "Create Profile", slug: "enroll" },
          { label: "My Profile", slug: "profile" },
          { label: "Dashboard", slug: "dashboard" },
          { label: "Edit Resume", slug: "edit-resume" },
          { label: "Settings", slug: "settings" },
          { label: "Logout", slug: "logout", onClick: handleLogout },
        ]}
        def={{ label: "Me", slug: "profile" }}
      />

      <div className="flex-1 items-center gap-3 flex justify-end">
  {/* Notification Bell */}
  {isLoggedIn && (
    <Link
      to={`${navPath}/notification`}
      className="p-2 bg-purple-100 rounded-full relative hover:bg-purple-200"
    >
      <Bell className="h-5 w-5 text-purple-700" />
      <span className="absolute top-1 right-1 bg-red-500 h-2.5 w-2.5 rounded-full" />
    </Link>
  )}

  {/* --- PROFILE DROPDOWN --- */}
  {isLoggedIn && user ? (
    <div className="relative group">
      {/* The Trigger Card */}
      <div className="flex items-center gap-3 border border-gray-200 bg-white px-4 py-1.5 rounded-xl shadow-sm group-hover:border-purple-500 transition cursor-pointer">
        <p className="text-gray-700 font-medium">{user.username}</p>
        <img
          src={user.picture || assets.body3_img}
          className="h-10 w-10 rounded-full object-cover border-2 border-purple-500"
          alt="avatar"
        />
      </div>

      {/* The Dropdown Menu (Shows on Hover) */}
      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <Link
          to={`${navPath}/profile`}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
        >
          My Profile
        </Link>
        <Link
          to={`${navPath}/dashboard`}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
        >
          Dashboard
        </Link>
        <Link
          to={`${navPath}/settings`}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
        >
          Settings
        </Link>
        
        <hr className="my-1 border-gray-100" />
        
        <button
          onClick={() => exitFromPlatform()}
          className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  ) : (
    /* Login Button */
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
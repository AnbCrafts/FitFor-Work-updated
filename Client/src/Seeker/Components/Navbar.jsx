import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Dropdown from "./Dropdown";
import Logo from "../../Global/Components/Logo";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { Bell, User } from "lucide-react";
import { assets } from "../assets/assets";
import NavPagesDropdown from "./NavPageDropdown";

const Navbar = () => {
  const location = useLocation();
  const { role, hash } = useParams();

  const { getUserIdByToken, getUserDataById, globalId, userData } =
    useContext(WorkContext);

  const [navPath, setNavPath] = useState("");

  /* Fetch User ID from token on mount or hash change */
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token && hash) getUserIdByToken(token);
  }, [hash]);

  /* Fetch user profile after globalId is available */
  useEffect(() => {
    if (globalId) getUserDataById(globalId);
  }, [globalId]);

  /* Set base path */
  useEffect(() => {
    setNavPath(`/auth/${role}/${hash}`);
  }, [role, hash]);

  const userPicture = userData?.picture;

  const navItem = (label, to) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition
      ${
        location.pathname === to
          ? "bg-purple-600 text-white"
          : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="w-[90%] mx-auto py-4 flex items-center justify-start gap-5 ">
      {/* Logo */}
      <Logo path={navPath} />

      {/* Primary Nav */}
      <NavPagesDropdown />


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

        <Dropdown
          Links={[
            { label: "Resume Enhancer", slug: "resume-enhancer" },
            { label: "Cover Letter Generator", slug: "generate/cover-letter" },
            { label: "Smart Recommendations", slug: "smart-job-recommendations" },
          ]}
          def={{ label: "AI Tools", slug: "resume-enhancer" }}
        />

        <Dropdown
          Links={[
            { label: "Create Profile", slug: "enroll" },
            { label: "My Profile", slug: "profile" },
            { label: "Dashboard", slug: "dashboard" },
            { label: "Edit Resume", slug: "edit-resume" },
            { label: "Settings", slug: "settings" },
            { label: "Logout", slug: "logout" },
          ]}
          def={{ label: "Me", slug: "profile" }} // fixed
        />

        <div className="flex-1 items-center gap-3 flex justify-end">
        {hash && (
          <Link
            to={`${navPath}/notification`}
            className="p-2 bg-purple-100 rounded-full relative hover:bg-purple-200"
          >
            <Bell className="h-5 w-5 text-purple-700" />
            <span className="absolute top-1 right-1 bg-red-500 h-2.5 w-2.5 rounded-full" />
          </Link>
        )}

        
        {hash ? (
          <Link
            to={`${navPath}/profile`}
            className="flex items-center gap-3 border border-gray-200 bg-white px-4 py-1.5 rounded-xl shadow-sm hover:border-purple-500 transition"
          >
            <p className="text-gray-700 font-medium">{userData?.username}</p>
            <img
              src={userPicture || assets.body3_img}
              className="h-10 w-10 rounded-full object-cover border-2 border-purple-500"
              alt="avatar"
            />
          </Link>
        ) : (
          <Link
            to="/enroll"
            className="px-5 py-2 rounded-lg border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition font-medium"
          >
            Login
          </Link>
        )}

        </div>

        {/* Notification */}


    </nav>
  );
};

export default Navbar;

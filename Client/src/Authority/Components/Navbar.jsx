import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Dropdown from './Dropdown';
import { assets } from '../assets/assets';
import { Bell, MessageCircle } from 'lucide-react';
import { WorkContext } from '../../ContextAPI/WorkContext';
import Logo from '../../Global/Components/Logo';

const Navbar = () => {
  const location = useLocation();
  const { hash, role } = useParams();
  const path = `/auth/${role}/${hash}`;

  const {
    getUserDataById,
    userData,
    getCompanyByOwnerId,
    authData,
  } = useContext(WorkContext);

  const id = localStorage.getItem("userId");

  useEffect(() => {
    if (id) {
      getUserDataById(id);
      getCompanyByOwnerId(id);
    }
  }, [hash]);

  const [userPicture, setUserPicture] = useState(null);
  useEffect(() => {
    if (userData?.picture) {
      setUserPicture(userData.picture);
    }
  }, [userData]);


  return (
    <div className="py-4 w-[90%] mx-auto flex items-center justify-between">

      {/* LEFT → LOGO */}
     <Logo path={path}/>

      {/* PRIMARY MENU → DROPDOWN */}
      <Dropdown
        def={{ label: "Menu", slug: "" }}
        Links={[
          { label: "Home", slug: "" },
          { label: "About", slug: "about" },
          { label: "Contact", slug: "contact" },
          { label: "Services", slug: "service" },
          { label: "Help", slug: "help" },
        ]}
        position="left"
      />

      {/* MAIN NAVIGATION DROPDOWNS */}
      <div className="flex items-center gap-4">

        <Dropdown
          def={{ label: "Jobs", slug: "jobs" }}
          Links={[
            { label: "Create Job", slug: "create/job-vacancy" },
            { label: "Posted Jobs", slug: "jobs" },
            { label: "Applications", slug: "applications" },
          ]}
        />

        <Dropdown
          def={{ label: "Profile", slug: "profile" }}
          Links={[
            { label: authData ? "Edit Profile" : "Create Profile", slug: authData ? "edit-panel" : "build/employer-form" },
            { label: "My Profile", slug: "profile" },
          ]}
        />

        <Dropdown
          def={{ label: "Applicants", slug: "applicant" }}
          Links={[
            { label: "All Applicants", slug: "applicant" },
            { label: "All Employees", slug: "employee" },
          ]}
        />

        <Dropdown
          def={{ label: "AI Tools", slug: "ai" }}
          Links={[
            { label: "Sort Applications", slug: "ai-sort" },
            { label: "Smart Suggestions", slug: "ai-suggest" },
          ]}
        />

      </div>

      {/* RIGHT → NOTIFICATION + PROFILE */}
      <div className="flex items-center gap-5">

        <Link
            to={`notification`}
            className="p-2 bg-purple-100 rounded-full relative hover:bg-purple-200"
          >
            <Bell className="h-5 w-5 text-purple-700" />
            <span className="absolute top-1 right-1 bg-red-500 h-2.5 w-2.5 rounded-full" />
          </Link>

        {id ? (
          <Link
            to={`${path}/profile`}
            className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white border border-gray-200 shadow hover:shadow-md transition"
          >
            <span className="text-gray-700 font-medium">{userData?.username}</span>
            <img
              src={userPicture || assets.body3_img}
              alt="Profile"
              className="h-10 w-10 rounded-full border border-purple-400"
            />
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-6 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
          >
            Login
          </Link>
        )}

      </div>

    </div>
  );
};

export default Navbar;

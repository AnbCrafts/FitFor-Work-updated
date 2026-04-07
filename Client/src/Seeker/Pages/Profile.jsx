import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { WorkContext } from "../../ContextAPI/WorkContext";
import AppliedJobCard from "../Components/AppliedCard";
import { 
  LogOutIcon, 
  Globe, 
  MoveLeftIcon, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Award, 
  BookOpen, 
  ClipboardList
} from "lucide-react";
import Dashboard from "../Components/Dashboard";

const Profile = () => {
  const { role, username } = useParams();
  const navigate = useNavigate();

  const {
    isLoggedIn,
    user,               // Updated: Replaces userData
    userSeekerData,     // Updated: Replaces user_seekerData
    myApplications,     // Updated: Replaces singleApplicantData
    getMySeekerProfile,
    getAppliedApplications,
    convertToStandardDateTime,
    exitFromPlatform
  } = useContext(WorkContext);

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  /* REPLACEMENT LOGIC: 
     Instead of looking for userToken in localStorage, we rely on 
     the app-wide checkAuthStatus (cookie-based). 
  */
  useEffect(() => {
    if (isLoggedIn) {
      // These call /me endpoints - no manual IDs required
      getMySeekerProfile();
      getAppliedApplications();
    }
  }, [isLoggedIn]);

  const handleLogout = () => setShowLogoutPopup(true);
  
  const confirmLogout = async () => {
    await exitFromPlatform(); // Clears HttpOnly cookies
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 w-[90%] mx-auto font-sans">
      
      {/* --- LOGOUT MODAL --- */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center transform transition-all">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOutIcon size={30} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Logout</h2>
            <p className="text-gray-600 mb-8">
              Are you sure you want to end your session? You will need to sign back in to apply for jobs.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={confirmLogout}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-200"
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="w-full mx-auto px-4">
        
        {/* Compact Header Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={user?.picture || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-50 shadow-inner"
              />
              <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-gray-600">
                <span className="flex items-center gap-1.5 text-sm"><Mail size={16} /> {user?.email}</span>
                <span className="flex items-center gap-1.5 text-sm"><UserIcon size={16} /> @{user?.username}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
             <Link
              to={`/auth/seeker/${user?.username}/settings`}
              className="px-4 py-2 text-sm bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              Edit Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200"
            >
              Logout <LogOutIcon size={16} />
            </button>
          </div>
        </div>

        {/* ANALYTICS SECTION: Dashboard Component */}
        <div className="mb-10">
           <Dashboard />
        </div>

        {/* SECTION: Personal Details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-6">
            <UserIcon className="text-purple-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</p>
              <p className="text-gray-800 font-medium">{user?.firstName} {user?.lastName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Phone</p>
              <p className="text-gray-800 font-medium">{user?.phone || "Not Provided"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</p>
              <p className="text-gray-800 font-medium">{user?.address || "No address saved"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Member Since</p>
              <p className="text-gray-800 font-medium">{convertToStandardDateTime(user?.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* SECTION: Professional Details */}
        {userSeekerData ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="text-purple-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Professional Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Desired Role</p>
                <p className="text-lg font-bold text-slate-900">{userSeekerData.desiredPost}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Experience</p>
                <p className="text-lg font-bold text-slate-900">{userSeekerData.experience} Years</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Expected CTC</p>
                <p className="text-lg font-bold text-slate-900">₹{userSeekerData.expectedCTC}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Location</p>
                <p className="text-lg font-bold text-slate-900">{userSeekerData.preferredLocation}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Skills Tag Cloud */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                   <Award size={16} /> Key Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userSeekerData.skills?.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border border-purple-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages Known */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                   <Globe size={16} /> Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userSeekerData.languagesKnown?.map((lang, i) => (
                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-100">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Resume & Portfolio Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
              <a
                href={userSeekerData.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl hover:border-purple-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Digital Resume</h3>
                    <p className="text-xs text-gray-500">View/Download PDF CV</p>
                  </div>
                </div>
                <MoveLeftIcon className="rotate-180 text-gray-300 group-hover:text-purple-600 transition" />
              </a>

              <a
                href={userSeekerData.portfolioLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl hover:border-purple-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Portfolio Link</h3>
                    <p className="text-xs text-gray-500">View projects & website</p>
                  </div>
                </div>
                <MoveLeftIcon className="rotate-180 text-gray-300 group-hover:text-blue-600 transition" />
              </a>
            </div>
          </div>
        ) : (
          /* Profile Empty Alert */
          <div className="bg-white border-2 border-dashed border-red-200 rounded-3xl p-10 text-center mb-8">
            <div className="bg-red-50 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Profile Incomplete</h3>
            <p className="text-gray-600 max-w-sm mx-auto mt-2">
              You haven't created your professional seeker profile yet. You need this to apply for jobs.
            </p>
            <Link
              to={`/auth/seeker/${user?.username}/enroll`}
              className="inline-block mt-6 px-8 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition"
            >
              Build Professional Profile
            </Link>
          </div>
        )}

        {/* SECTION: Recent Applications */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-purple-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Applied Jobs</h2>
            </div>
            <Link to={`/auth/seeker/${user?.username}/my-applications`} className="text-purple-600 font-semibold hover:underline">
              View All
            </Link>
          </div>

          {myApplications && myApplications.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto noScroll pb-4">
              {myApplications.map((item, index) => (
                <div key={index} className="min-w-[320px]">
                  <AppliedJobCard
                    jobId={item.jobId}
                    companyId={item.companyId}
                    appliedAt={item.appliedAt}
                    status={item.status}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-gray-400 font-medium">You haven't applied to any jobs yet.</p>
              <Link to={`/auth/seeker/${user?.username}/jobs`} className="mt-4 inline-block text-purple-600 font-bold hover:underline">
                Browse Marketplace →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
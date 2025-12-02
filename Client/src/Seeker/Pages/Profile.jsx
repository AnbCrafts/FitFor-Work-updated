import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { WorkContext } from "../../ContextAPI/WorkContext";
import AppliedJobCard from "../Components/AppliedCard";
import { LogOutIcon, Globe, MoveLeftIcon } from "lucide-react";
import Dashboard from "../Components/Dashboard";

const Profile = () => {
  const { hash } = useParams();
  const navigate = useNavigate();

  const {
    getUserIdByToken,
    globalId,
    getUserDataById,
    userData,
    convertToStandardDateTime,
    getSeekerDataByUserId,
    user_seekerData,
    getApplicantBySeekerId,
    singleApplicantData,
    resetOnExit,
  } = useContext(WorkContext);

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  /* Load user ID */
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token && hash) getUserIdByToken(token);
  }, [hash]);

  /* Load user profile */
  useEffect(() => {
    if (globalId) {
      getUserDataById(globalId);
      getSeekerDataByUserId(globalId);
    }
  }, [globalId]);

  /* Load applied jobs */
  useEffect(() => {
    if (user_seekerData?._id) {
      getApplicantBySeekerId(user_seekerData._id);
    }
  }, [user_seekerData]);

  const handleLogout = () => setShowLogoutPopup(true);
  const confirmLogout = () => {
    resetOnExit();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 w-[90%] mx-auto ">
      {/* Logout Modal */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center w-full">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full  text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!showLogoutPopup && (
        <div className="w-full mx-auto px-4">
          {/* Compact Header */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={userData?.picture}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border border-purple-300"
              />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {userData?.firstName} {userData?.lastName}
                </h1>
                <p className="text-gray-600">{userData?.email}</p>
                <p className="text-gray-600">Username: {userData?.username}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-100 text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-200 transition"
            >
              Logout
              <LogOutIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Dashboard (your existing component) */}
          <Dashboard />

          {/* Registration Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Personal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Full Name: </span>
                  {userData?.firstName} {userData?.lastName}
                </p>
                <p className="text-gray-600 mt-2">
                  <span className="font-medium text-gray-900">Email: </span>
                  {userData?.email}
                </p>
                <p className="text-gray-600 mt-2">
                  <span className="font-medium text-gray-900">Phone: </span>
                  {userData?.phone}
                </p>
              </div>

              <div>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">
                    Registered On:
                  </span>{" "}
                  {convertToStandardDateTime(userData?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          {user_seekerData && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Professional Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-600">
                <p>
                  <span className="font-medium text-gray-900">
                    Preferred Location:
                  </span>{" "}
                  {user_seekerData.preferredLocation}
                </p>
                <p>
                  <span className="font-medium text-gray-900">
                    Desired Role:
                  </span>{" "}
                  {user_seekerData.desiredPost}
                </p>
                <p>
                  <span className="font-medium text-gray-900">
                    Expected CTC:
                  </span>{" "}
                  {user_seekerData.expectedCTC}
                </p>
                <p>
                  <span className="font-medium text-gray-900">
                    Experience:
                  </span>{" "}
                  {user_seekerData.experience} years
                </p>

                <p className="col-span-2">
                  <span className="font-medium text-gray-900">Skills:</span>{" "}
                  {user_seekerData.skills.join(", ")}
                </p>
                <p className="col-span-2">
                  <span className="font-medium text-gray-900">Languages:</span>{" "}
                  {user_seekerData.languagesKnown.join(", ")}
                </p>

                <p>
                  <span className="font-medium text-gray-900">
                    Preferred Work Mode:
                  </span>{" "}
                  {user_seekerData.preferredJobType}
                </p>
                <p>
                  <span className="font-medium text-gray-900">
                    Available From:
                  </span>{" "}
                  {convertToStandardDateTime(
                    user_seekerData.availableFrom
                  )}
                </p>

                <p className="col-span-2">
                  <span className="font-medium text-gray-900">
                    Qualifications:
                  </span>{" "}
                  {user_seekerData.qualifications}
                </p>

                <p className="col-span-2">
                  <span className="font-medium text-gray-900">
                    Certifications:
                  </span>{" "}
                  {user_seekerData.certifications.join(", ")}
                </p>
              </div>

              {/* Resume Card */}
              <div className="mt-6 bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Resume
                    </h3>
                    <p className="text-gray-600 text-sm">
                      View your uploaded resume
                    </p>
                  </div>
                </div>
                <a
                  href={user_seekerData.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700"
                >
                  View
                </a>
              </div>

              {/* Portfolio Card */}
              <div className="mt-4 bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Portfolio
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Your personal website
                    </p>
                  </div>
                </div>
                <a
                  href={user_seekerData.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700"
                >
                  Visit
                </a>
              </div>
            </div>
          )}

          {/* Applied Jobs */}
          {singleApplicantData && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Applied Jobs
              </h2>

              <div className="flex gap-4 overflow-x-auto noScroll py-3">
                {singleApplicantData.map((item, index) => (
                  <AppliedJobCard
                    key={index}
                    jobId={item.jobId}
                    companyId={item.companyId}
                    appliedAt={item.appliedAt}
                    status={item.status}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Alerts for missing data */}
          <div className="mt-6">
            {user_seekerData === null && (
              <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded-md flex items-center justify-between">
                <p className="text-red-700">
                  Your seeker profile is incomplete. You cannot apply to jobs.
                </p>
                <Link
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  to={`/auth/seeker/${hash}/enroll`}
                >
                  Create Now
                </Link>
              </div>
            )}

            {singleApplicantData === null && (
              <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded-md flex items-center justify-between mt-4">
                <p className="text-yellow-700">
                  You haven't applied for any jobs yet.
                </p>
                <Link
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
                  to={`/auth/seeker/${hash}/jobs`}
                >
                  Apply Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

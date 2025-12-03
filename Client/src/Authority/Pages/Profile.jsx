import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { useNavigate, useParams } from "react-router-dom";
import JobCard from "../Components/JobCard";
import PageNav from "../../Global/Components/PageNav";
import { LogOutIcon, PencilIcon } from "lucide-react";
import Dashboard from "../Components/Dashboard";

const Profile = () => {
  const { hash } = useParams();
  const {
    authData,
    getCompanyByOwnerId,
    getUserDataById,
    userData,
    getJobByAuthority,
    jobs,
    convertToStandardDateTime,
    getEmployeeByCompany,
    thisAuthAllEmployees,
    resetOnExit,
  } = useContext(WorkContext);

  const navigate = useNavigate();

  // Fetch Profile Data
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      getCompanyByOwnerId(id);
      getUserDataById(id);
    }
  }, [hash]);

  // Fetch Jobs + Employees
  useEffect(() => {
    if (authData && authData._id) {
      getJobByAuthority(authData._id);
      getEmployeeByCompany(authData._id);
    }
  }, [authData]);

  // Pagination
  const [currentJobPage, setCurrentJobPage] = useState(1);
  const jobsPerPage = 6;
  const indexOfLastJob = currentJobPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs?.slice(indexOfFirstJob, indexOfLastJob);
  const totalJobPages = Math.ceil(jobs?.length / jobsPerPage);

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const confirmLogout = () => {
    resetOnExit();
    navigate("/");
  };

  return (
    <>
      {/* LOGOUT POPUP */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Confirm Logout
            </h2>
            <p className="text-gray-500 mb-6">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLogout}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              >
                Logout
              </button>

              <button
                onClick={() => setShowLogoutPopup(false)}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PAGE */}
      {!showLogoutPopup && (
        <div className="min-h-screen w-full bg-[#F7F7FB] pb-20">
          {/* TOP CARD */}
          <div className="w-[90%] my-5 mx-auto mt-6 bg-white rounded-2xl shadow-md p-10 border border-gray-100 flex justify-between gap-10">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-800">
                Hi <span className="text-purple-600">{userData?.firstName}</span> 👋
              </h1>
              <p className="text-gray-500 text-lg">
                Here’s your complete company profile overview.
              </p>

              <ul className="mt-4 text-gray-600 space-y-1">
                <li>• Company details</li>
                <li>• Job postings</li>
                <li>• Applications received</li>
                <li>• Employee overview</li>
              </ul>
            </div>

            <div className="flex gap-4 items-start">
              <button
                onClick={() => navigate("edit-panel")}
                className="flex items-center gap-2 border border-purple-600 text-purple-600 px-5 py-2 rounded-xl font-medium hover:bg-purple-600 hover:text-white transition-all"
              >
                <PencilIcon size={18} /> Edit Profile
              </button>

              <button
                onClick={() => setShowLogoutPopup(true)}
                className="flex items-center gap-2 border border-red-500 text-red-500 px-5 py-2 rounded-xl font-medium hover:bg-red-500 hover:text-white transition-all"
              >
                Logout <LogOutIcon size={18} />
              </button>
            </div>
          </div>

          {/* DASHBOARD */}
          <Dashboard />

          {/* USER PROFILE SECTION */}
          <div className="w-[90%] mx-auto bg-white mt-10 rounded-2xl shadow-md p-10 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              My Profile
            </h2>

            <div className="flex gap-10 flex-wrap items-start">
              <img
                src={userData ? userData.picture : assets.bg}
                alt=""
                className="h-[180px] w-[180px] rounded-full border-4 border-purple-300 object-cover shadow-md"
              />

              <div className="space-y-2 text-gray-700">
                <p>
                  <b>Name:</b> {userData?.firstName} {userData?.lastName}
                </p>
                <p>
                  <b>Username:</b> {userData?.username}
                </p>
                <p>
                  <b>Email:</b> {userData?.email}
                </p>
                <p>
                  <b>Phone:</b> {userData?.phone}
                </p>
                <p>
                  <b>Address:</b> {userData?.address}
                </p>
                <p>
                  <b>Profile Created:</b>{" "}
                  {convertToStandardDateTime(userData?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* COMPANY DETAILS */}
          <div className="w-[90%] mx-auto bg-white mt-10 rounded-2xl shadow-md p-10 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              Company Details
            </h2>

            <div className="flex gap-10 flex-wrap items-start">
              <img
                src={authData?.companyLogo}
                alt=""
                className="h-[180px] w-[180px] rounded-full border-4 border-purple-300 object-cover shadow-md"
              />

              <div className="text-gray-700 space-y-2">
                <p>
                  <b>Company Name:</b> {authData?.companyName}
                </p>
                <p>
                  <b>Contact:</b> {authData?.contactNumber}
                </p>
                <p>
                  <b>Email:</b> {authData?.companyEmail}
                </p>
                <p>
                  <b>Registered:</b>{" "}
                  {convertToStandardDateTime(authData?.createdAt)}
                </p>
              </div>
            </div>

            {/* Recruitment Details */}
            <div className="mt-10 p-6 bg-[#F9FAFF] rounded-xl border border-purple-100">
              <h3 className="text-xl font-semibold text-gray-700 mb-5">
                Recruitment Details
              </h3>

              <div className="grid md:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <b>Location:</b> {authData?.location}
                </p>
                <p>
                  <b>Industry:</b> {authData?.industry}
                </p>

                <p className="col-span-2">
                  <b>Skills Required: </b>
                  {authData?.preferredSkills?.map((s, i) => (
                    <span
                      key={i}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm mr-2"
                    >
                      {s}
                    </span>
                  ))}
                </p>

                <p>
                  <b>Experience:</b> {authData?.preferredExperience} yrs
                </p>

                <p>
                  <b>Website:</b> {authData?.companyWebsite}
                </p>
              </div>
            </div>
          </div>

          {/* JOBS */}
          <div className="w-[90%] mx-auto mt-14">
            <h2 className="text-3xl font-bold text-gray-700 mb-8">
              Posted Jobs
            </h2>

            <div className="flex flex-wrap gap-6">
              {currentJobs?.map((item) => (
                <JobCard key={item._id} {...item} />
              ))}
            </div>

            <div className="mt-5">
              <PageNav
                currentPage={currentJobPage}
                totalPages={totalJobPages}
                incrementer={setCurrentJobPage}
              />
            </div>
          </div>

          {/* EMPLOYEES */}
          <div className="w-[90%] mx-auto mt-20">
            <h2 className="text-3xl font-bold text-gray-700 mb-8">
              Hired Employees
            </h2>

            <div className="flex flex-wrap gap-6">
              {thisAuthAllEmployees?.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`${item.id}`)}
                  className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-purple-300/50 transition-all min-w-[330px]"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.picture}
                      className="h-20 w-20 rounded-full object-cover border-4 border-purple-300"
                    />
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-gray-500">{item.email}</p>
                      <p className="text-gray-500">{item.phone}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.skills?.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-600 mt-3">
                    <b>Available From:</b>{" "}
                    {new Date(item.availableFrom).toLocaleDateString()}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-4">
                    <a
                      href={item.resume}
                      target="_blank"
                      className="text-sm px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                    >
                      View Resume
                    </a>
                    <a
                      href={item.portfolioLink}
                      target="_blank"
                      className="text-sm px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                    >
                      Portfolio
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default Profile;

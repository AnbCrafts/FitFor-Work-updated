// Jobs.jsx — Premium FitForWork Layout (Improved)
import React, { useContext, useEffect, useState } from "react";
import JobCard from "../Components/JobCard";
import Filters from "../Components/Filters";
import ApplySteps from "../Components/ApplySteps";
import Bottom from "../Components/Bottom";
import PageNav from "../../Global/Components/PageNav";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { Link, useParams } from "react-router-dom";

const Jobs = () => {
  const {
    getUserIdByToken,
    globalId,
    getAllJobsFromDB,
    allJobs = [],
    getAllRequirementsForJob,
    requirements = {},
    getSeekerDataById,
  } = useContext(WorkContext);

  const { hash } = useParams();

  // Fetch user + requirements + jobs
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token && hash) getUserIdByToken(token);
  }, [hash]);

  useEffect(() => {
    if (globalId) getSeekerDataById(globalId);
  }, [globalId]);

  useEffect(() => {
    getAllJobsFromDB();
    getAllRequirementsForJob();
  }, []);

  // Pagination
  const [currentJobPage, setCurrentJobPage] = useState(1);
  const jobsPerPage = 8;
  const indexOfLastJob = currentJobPage * jobsPerPage;
  const currentJobs = allJobs.slice(indexOfLastJob - jobsPerPage, indexOfLastJob);
  const totalJobPages = Math.max(1, Math.ceil(allJobs.length / jobsPerPage));

  // Mobile filters drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1350px] mx-auto px-4 py-8">

        {/* Mobile Filters Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Job Listings</h2>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md"
          >
            {drawerOpen ? "Close Filters" : "Filters"}
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-12 gap-8">

          {/* LEFT — FILTERS */}
          <aside
            className={`col-span-12 lg:col-span-3 ${
              drawerOpen ? "" : "hidden lg:block"
            }`}
          >
            <div className="sticky top-24 flex flex-col gap-6 w-fit">

              {/* Hard-coded common groups */}
              <Filters head="Category" options={requirements?.category || []} />
              <Filters head="Location" options={requirements?.location || []} />
              <Filters head="Company" options={requirements?.company || []} />

              {/* Dynamic rest */}
              {Object.entries(requirements).map(([k, v]) => {
                if (["category", "location", "company", "ownerIds"].includes(k)) return null;
                return (
                  <Filters key={k} head={k} options={Array.isArray(v) ? v : []} />
                );
              })}
            </div>
          </aside>

          {/* CENTER — JOBS LIST */}
          <main className="col-span-12 lg:col-span-6">
            <div className="flex flex-col gap-6">
              {currentJobs.length === 0 ? (
                <div className="text-center bg-white border border-gray-200 p-6 rounded-xl text-gray-600">
                  No jobs available.
                </div>
              ) : (
                currentJobs.map((job, idx) => (
                  <JobCard key={job?._id ?? idx} job={job} />
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
              <PageNav
                currentPage={currentJobPage}
                totalPages={totalJobPages}
                incrementer={setCurrentJobPage}
              />
            </div>
          </main>

          {/* RIGHT — APPLY STEPS / QUICK LINKS */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="sticky top-24 flex flex-col gap-6">

              <ApplySteps />

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 text-lg">Quick Links</h4>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link
                      to={`/auth/seeker/${hash}/resume-builder`}
                      className="text-purple-600 hover:underline"
                    >
                      Resume Builder
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={`/auth/seeker/${hash}/saved-jobs`}
                      className="text-purple-600 hover:underline"
                    >
                      Saved Jobs
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </aside>
        </div>

        <Bottom />
      </div>
    </div>
  );
};

export default Jobs;

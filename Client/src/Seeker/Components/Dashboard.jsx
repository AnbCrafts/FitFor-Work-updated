// Dashboard.jsx
import React, { useContext, useEffect, useState } from "react";
/* NOTE: removed "./ChartRegister.jsx" import to avoid double-registration errors.
   Ensure you register chartjs components in a single place (e.g. top-level App or a single ChartRegister file). */
import ApplicationStatusPie from "./Pie.jsx";
import ApplicationsLineChart from "./Line.jsx";
import JobCategoryBarChart from "./Bar.jsx";
import LocationHorizontalBar from "./HorBar.jsx";
import ResumeScoreRadar from "./radar.jsx";
import { WorkContext } from "../../ContextAPI/WorkContext.jsx";
import { Link, useParams } from "react-router-dom";

/**
 * FitForWork - Seeker Dashboard (Mixed Mode)
 * - Light cards for main content
 * - Subtle dark widgets for right-side quick actions (mixed look)
 * - Fixed chart sizing and data-safety logic
 */

const Dashboard = () => {
  const {
    getUserIdByToken,
    globalId,
    fetchApplicationStatusPie,
    fetchApplicationsByCategory,
    fetchApplicationsByDate,
    fetchApplicationsByLocation,
    fetchResumeGrade,
    graphData,
    getSeekerDataByUserId,
    user_seekerData,
    getSuggestedJobsForThisSeeker,
    suggestedJobsForThisSeeker,
  } = useContext(WorkContext);

  const { role, hash } = useParams();
  const [seekerId, setSeekerId] = useState(null);

  // --- initial token -> user id resolution (preserve original)
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (hash) getUserIdByToken(token);
  }, [hash, getUserIdByToken]);

  // --- get seeker data when globalId resolves
  useEffect(() => {
    if (globalId) getSeekerDataByUserId(globalId);
  }, [globalId, getSeekerDataByUserId]);

  // --- extract seeker id
  useEffect(() => {
    if (user_seekerData?._id) setSeekerId(user_seekerData._id);
  }, [user_seekerData]);

  // --- fetch graphs when seekerId available
  useEffect(() => {
    if (seekerId) {
      // fetchApplicationStatusPie(seekerId);
      // fetchApplicationsByDate(seekerId);
      // fetchApplicationsByCategory(seekerId);
      // fetchApplicationsByLocation(seekerId);
      // fetchResumeGrade(seekerId);
      // getSuggestedJobsForThisSeeker(seekerId);
    }
  }, [
    seekerId,
    fetchApplicationStatusPie,
    fetchApplicationsByDate,
    fetchApplicationsByCategory,
    fetchApplicationsByLocation,
    fetchResumeGrade,
    getSuggestedJobsForThisSeeker,
  ]);

  const navLink = `/auth/${role}/${hash}`;

  // --- Safe counts
  const appliedCount = user_seekerData?.appliedFor?.length ?? 0;
  const savedCount = user_seekerData?.savedJobs?.length ?? 0;
  const matchCount = suggestedJobsForThisSeeker?.totalMatches ?? (suggestedJobsForThisSeeker?.suggestedJobs?.length ?? 0);
  const contactedCount = user_seekerData?.companiesContacted?.length ?? 0; // fixed logic

  // --- Normalize grade: graphData.grade could be { brief: {...}, percent: 80 } or number
  const gradeObj = (() => {
    const g = graphData?.grade;
    if (!g) return { percent: null, brief: null };

    // If it's a number -> treat as percent
    if (typeof g === "number") return { percent: g, brief: null };

    // If it's an object
    const percent =
      typeof g.percent === "number" ? g.percent : typeof g.score === "number" ? g.score : null;

    // Prefer `brief` if present; else try to convert if g is a map of brief keys
    const brief = g.brief && typeof g.brief === "object" ? g.brief : null;

    return { percent, brief };
  })();

  return (
    <div className="min-h-screen bg-gray-100 border-t border-purple-400 text-gray-800">
      <div className="max-w-[90%] mx-auto py-8 px-4">
        {/* Top Navigation (compact) */}
       

        {/* Hero / Summary */}
        <section className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back,{" "}
                <span className="text-purple-600">{user_seekerData?.firstName ?? "Seeker"}</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Quick snapshot of your job journey — opportunities, activity, and progress.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`${navLink}/profile`}
                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition text-sm"
              >
                View Profile
              </Link>

              <Link
                to={`${navLink}/jobs`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition text-sm"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Applications Submitted"
            value={appliedCount}
            ctaText="View now"
            to={`${navLink}/my-applications`}
          />
          <KpiCard title="Jobs Viewed / Saved" value={savedCount} ctaText="View now" to={`${navLink}/saved-jobs`} />
          <KpiCard title="Matched Jobs" value={matchCount} ctaText="Explore" to={`${navLink}/jobs`} />
          <KpiCard title="Companies Contacted" value={contactedCount} ctaText="View now" to={`${navLink}/contacts`} />
        </section>

        {/* Charts area */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Left column: two stacked charts (light cards) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Status</h3>

              <div className="flex flex-col lg:flex-row items-stretch gap-6">
                <div className="w-full lg:w-56">
                  {/* Chart components are designed as white cards themselves.
                      We keep a neutral wrapper and allow inner components to show their card. */}
                  {graphData?.pie ? (
                    <ApplicationStatusPie data={graphData.pie} />
                  ) : (
                    <div className="h-44 w-full flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      No data
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Overview of your application pipeline — tracking views, interviews, shortlists, and rejections.
                  </p>

                  <div className="mt-4 h-44">
                    {graphData?.line ? (
                      <ApplicationsLineChart data={graphData.line} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
                        No data
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Categories & Locations</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">By Category</h4>
                  {graphData?.bar ? (
                    <JobCategoryBarChart data={graphData.bar} />
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      No data
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">By Location</h4>
                  {graphData?.horBar ? (
                    <LocationHorizontalBar data={graphData.horBar} />
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      No data
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: resume grade & quick tips (mixed - darker widget) */}
          <aside className="flex flex-col gap-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Resume Strength</h3>

              {gradeObj.brief ? (
                <div>
                  <div className="h-44">
                    <ResumeScoreRadar data={{ brief: gradeObj.brief }} />
                  </div>
                  <p className="mt-4 text-sm text-gray-600">Your resume strength is evaluated across core sections.</p>
                </div>
              ) : gradeObj.percent !== null ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full w-28 h-28 flex items-center justify-center bg-purple-50 border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">{gradeObj.percent}%</div>
                  </div>
                  <p className="text-sm text-gray-600">Resume Score</p>
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
                  No data
                </div>
              )}
            </div>

            {/* Mixed-mode widget: darker quick actions */}
            <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-sm text-white">
              <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>

              <div className="grid grid-cols-1 gap-3">
                <Link to={`${navLink}/profile`} className="px-3 py-2 bg-purple-600 rounded-lg text-sm text-white text-center">
                  Update Profile
                </Link>
                <Link to={`${navLink}/resume-builder`} className="px-3 py-2 bg-transparent rounded-lg text-sm text-white text-center border border-gray-800">
                  Improve Resume
                </Link>
                <Link to={`${navLink}/jobs`} className="px-3 py-2 bg-transparent rounded-lg text-sm text-white text-center border border-gray-800">
                  Browse Matches
                </Link>
              </div>
            </div>
          </aside>
        </section>

        {/* Recent activity */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActivityRow title="UI/UX Designer - Microsoft" note="Viewed by recruiter • 2 days ago" />
            <ActivityRow title="Backend Developer - Amazon" note="Application submitted • 3 days ago" />
            <ActivityRow title="Data Analyst - Swiggy" note="Shortlisted • 5 days ago" />
            <ActivityRow title="Full Stack Intern - TCS" note="Rejected • 6 days ago" />
          </div>
        </section>

        {/* Suggested Jobs */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Suggested Jobs for You</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedJobsForThisSeeker?.suggestedJobs?.slice(0, 9).map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.location}</p>
                <p className="text-sm text-gray-500 mt-2 truncate">{item.description}</p>
                <div className="mt-4 flex items-center gap-3">
                  <Link to={`/auth/${role}/${hash}/jobs/detail/${item._id}`} className="px-3 py-2 bg-purple-600 rounded-md text-sm text-white">
                    Apply Now
                  </Link>
                  <span className="text-sm text-gray-600">{item.jobType} • {item.jobRole}</span>
                </div>
              </div>
            ))}

            {!suggestedJobsForThisSeeker?.suggestedJobs?.length && (
              <div className="col-span-full text-gray-500">No suggestions yet — complete your profile for better matches.</div>
            )}
          </div>

          {suggestedJobsForThisSeeker?.suggestedJobs?.length > 9 && (
            <div className="text-center mt-6">
              <Link to={`/auth/${role}/${hash}/jobs`} className="px-4 py-2 bg-transparent border border-purple-600 text-purple-600 rounded-md">
                Show all suggestions
              </Link>
            </div>
          )}
        </section>

        {/* Profile completion and upskill */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="font-semibold mb-2 text-gray-900">Profile Completion</h4>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              {/* Safe width: if percent available else fallback to 50% */}
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: gradeObj.percent !== null ? `${gradeObj.percent}%` : "50%" }}
              />
            </div>
            <p className="mt-3 text-sm text-gray-600">Resume Score: {gradeObj.percent ?? "50"}%</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="font-semibold mb-2 text-gray-900">Recommended Upskills</h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Build projects with MongoDB aggregation</li>
              <li>Practice JavaScript DSA questions</li>
              <li>Learn Resume Optimization tips</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ---------- Subcomponents (UI-only) ---------- */

const KpiCard = ({ title, value, ctaText, to }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <h4 className="text-sm text-gray-600">{title}</h4>
        <div className="mt-4 flex items-center gap-4">
          <div className="bg-purple-600 text-white rounded-xl w-14 h-14 flex items-center justify-center text-xl font-bold">
            {value}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">Quick overview</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {to ? (
          <Link to={to} className="text-sm px-3 py-1 bg-transparent rounded-md border border-purple-600 text-purple-600">
            {ctaText}
          </Link>
        ) : (
          <button className="text-sm px-3 py-1 bg-transparent rounded-md border border-purple-600 text-purple-600">{ctaText}</button>
        )}
      </div>
    </div>
  );
};

const ActivityRow = ({ title, note }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <p className="font-semibold text-gray-900">{title}</p>
    <p className="text-sm text-gray-500">{note}</p>
  </div>
);

export default Dashboard;

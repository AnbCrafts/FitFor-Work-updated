import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { WorkContext } from "../../ContextAPI/WorkContext";
import ApplicationsByCategory from "./ApplicationByCategory";
import ApplicationsByJobType from "./ApplicationByType";
import ApplicationsByRole from "./ApplicationByRole";
import ApplicationsByLocation from "./ApplicationByLocation";
import WeeklyApplications from "./ApplicationByWeek";
import ApplicationsPerJob from "./ApplicationByJob";
import ApplicantStatusPie from "./ApplicationStatus";
import SeekerCard from "./SeekerCard";

/**
 * Employer Dashboard — White SaaS theme
 * - preserves all WorkContext calls and components
 * - adds loading states, proper useEffect deps, and improved layout
 */

const Dashboard = () => {
  const { hash } = useParams();
  const {
    getCompanyByOwnerId,
    authData,
    getApplicantsStatusWeekly,
    getApplicationsByLocations,
    getApplicationCountPerJob,
    getApplicantsStatus,
    getApplicationsByRoles,
    getApplicationsByTypes,
    getApplicationsByCategory,
    getMatchedData,
    applicationCountByCategory,
    applicationCountByType,
    applicationCountByRole,
    applicationCountByLocation,
    applicantStatusWeekly,
    applicationCountPerJob,
    applicantStatus,
    matchedData,
  } = useContext(WorkContext);

  // local state for loading bits
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // fetch owner company on mount (once)
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) getCompanyByOwnerId(id);
    // only on mount/hash change (owner id retrieval lives in context)
  }, [hash, getCompanyByOwnerId]);

  // derive authId from authData safely
  const authId = authData?._id ?? null;

  // fetch all analytics once authId is available
  useEffect(() => {
    if (!authId) return;

    setLoadingCharts(true);
    Promise.allSettled([
      getApplicantsStatusWeekly(authId),
      getApplicationsByLocations(authId),
      getApplicationCountPerJob(authId),
      getApplicantsStatus(authId),
      getApplicationsByRoles(authId),
      getApplicationsByTypes(authId),
      getApplicationsByCategory(authId),
    ])
      .finally(() => setLoadingCharts(false));

    // fetch matches separately (so we can show partial UI while charts load)
    setLoadingMatches(true);
    getMatchedData(authId).finally(() => setLoadingMatches(false));

    // intentionally no deps on fetch functions to avoid repeated calls
    // they are stable coming from context in your app
  }, [authId, getApplicantsStatusWeekly, getApplicationsByLocations, getApplicationCountPerJob, getApplicantsStatus, getApplicationsByRoles, getApplicationsByTypes, getApplicationsByCategory, getMatchedData]);

  // small helpers
  const safeCount = (arr) => (Array.isArray(arr) ? arr.length : 0);
  const totalMatches = matchedData?.totalMatches ?? 0;
  const matchedSeekers = matchedData?.seekers ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="w-[90%] mx-auto px-4">

        {/* Page header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Recruitment Insights & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Visualize job performance, applicant trends and manage your hiring pipeline.</p>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card accent="purple">
            <div className="text-sm text-gray-600">Jobs Posted</div>
            <div className="text-2xl font-bold text-gray-900">{safeCount(authData?.jobs)}</div>
          </Card>

          <Card accent="green">
            <div className="text-sm text-gray-600">Hired Seekers</div>
            <div className="text-2xl font-bold text-gray-900">{safeCount(authData?.hiredSeekers)}</div>
          </Card>

          <Card accent="red">
            <div className="text-sm text-gray-600">Rejected Seekers</div>
            <div className="text-2xl font-bold text-gray-900">{safeCount(authData?.rejectedSeekers)}</div>
          </Card>

          <Card accent="blue">
            <div className="text-sm text-gray-600">Seekers to Review</div>
            <div className="text-2xl font-bold text-gray-900">{safeCount(authData?.SeekersToReview)}</div>
          </Card>
        </section>

        {/* Charts grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 space-y-4">
            <ChartCard title="Applications by Category" loading={loadingCharts}>
              {applicationCountByCategory?.length > 0 ? (
                <ApplicationsByCategory data={applicationCountByCategory} />
              ) : (
                <EmptyHint message="No category data available." />
              )}
            </ChartCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartCard title="Applications Over Time" loading={loadingCharts}>
                {applicantStatusWeekly?.length > 0 ? (
                  <WeeklyApplications data={applicantStatusWeekly} />
                ) : (
                  <EmptyHint message="No weekly data available." />
                )}
              </ChartCard>

              <ChartCard title="Applications Per Job" loading={loadingCharts}>
                {applicationCountPerJob?.length > 0 ? (
                  <ApplicationsPerJob data={applicationCountPerJob} />
                ) : (
                  <EmptyHint message="No per-job data available." />
                )}
              </ChartCard>
            </div>
          </div>

          <div className="space-y-4">
            <ChartCard title="Application Status" loading={loadingCharts}>
              {applicantStatus && Object.keys(applicantStatus).length > 0 ? (
                <ApplicantStatusPie data={applicantStatus} />
              ) : (
                <EmptyHint message="No status data available." />
              )}
            </ChartCard>

            <ChartCard title="By Location" loading={loadingCharts}>
              {applicationCountByLocation?.length > 0 ? (
                <ApplicationsByLocation data={applicationCountByLocation} />
              ) : (
                <EmptyHint message="No location data available." />
              )}
            </ChartCard>
          </div>
        </section>

        {/* Role & Type breakdown */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ChartCard title="By Role" loading={loadingCharts}>
            {applicationCountByRole?.length > 0 ? (
              <ApplicationsByRole data={applicationCountByRole} />
            ) : (
              <EmptyHint message="No role data available." />
            )}
          </ChartCard>

          <ChartCard title="By Job Type" loading={loadingCharts}>
            {applicationCountByType?.length > 0 ? (
              <ApplicationsByJobType data={applicationCountByType} />
            ) : (
              <EmptyHint message="No type data available." />
            )}
          </ChartCard>
        </section>

        {/* Matched seekers */}
        <section className="mb-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {totalMatches === 0 ? "No matching seekers found" : `Suggested Seekers (${totalMatches})`}
          </h2>

          {loadingMatches ? (
            <div className="text-sm text-gray-500">Loading suggested seekers…</div>
          ) : totalMatches === 0 ? (
            <div className="text-sm text-gray-600">No seekers match your current criteria. Try broadening filters.</div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {matchedSeekers.slice(0, 4).map((s, i) => (
                <SeekerCard key={s._id ?? i} item={s} id={i} />
              ))}
              <div className="w-full mt-4 text-center">
                <Link to="suggested/list/all" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  View all suggestions
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Company info & preferred criteria */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <img src={authData?.companyLogo} alt="logo" className="w-16 h-16 object-contain rounded-md" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{authData?.companyName}</h3>
                <p className="text-sm text-gray-600">{authData?.industry}</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-700 space-y-1">
              <div><strong>Email:</strong> {authData?.companyEmail || "—"}</div>
              <div><strong>Phone:</strong> {authData?.contactNumber || "—"}</div>
              <div><strong>Website:</strong> {authData?.companyWebsite ? <a href={authData.companyWebsite} target="_blank" rel="noreferrer" className="text-indigo-600">{authData.companyWebsite}</a> : "—"}</div>
              <div><strong>Size:</strong> {authData?.companySize || "—"}</div>
              <div><strong>Location:</strong> {authData?.location || "—"}</div>
              <div><strong>Job Types:</strong> {(authData?.jobTypesOffered || []).join(", ") || "—"}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Preferred Criteria</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div><strong>Experience:</strong> {authData?.preferredExperience ?? "0"}+ years</div>
              <div>
                <strong>Skills:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(authData?.preferredSkills || []).map((sk, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">{sk}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Suggestions */}
        <section className="mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Suggestions to improve hiring</h3>
            <ul className="text-sm text-gray-600 mt-3 list-disc pl-5 space-y-1">
              <li>Close expired jobs to keep the dashboard focused.</li>
              <li>Shortlist candidates within 48 hours to keep momentum.</li>
              <li>Complete the company profile and add a clear logo.</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;

/* ---------- small UI helper components ---------- */

const Card = ({ children, accent = "purple" }) => {
  const accentMap = {
    purple: "bg-gradient-to-r from-purple-400 to-indigo-500 text-white",
    green: "bg-green-500 text-white",
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
  };
  return (
    <div className={`rounded-xl p-4 shadow-sm ${accentMap[accent] || accentMap.purple}`}>
      {children}
    </div>
  );
};

const ChartCard = ({ title, children, loading = false }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    <h4 className="text-sm text-gray-600 mb-3">{title}</h4>
    <div className="min-h-[180px] flex items-center justify-center">
      {loading ? <div className="text-sm text-gray-400">Loading...</div> : children}
    </div>
  </div>
);

const EmptyHint = ({ message }) => (
  <div className="text-sm text-gray-500">{message}</div>
);

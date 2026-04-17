import React, { useContext, useEffect, useState } from "react";
import ApplicationStatusPie from "./Pie.jsx";
import ApplicationsLineChart from "./Line.jsx";
import JobCategoryBarChart from "./Bar.jsx";
import LocationHorizontalBar from "./HorBar.jsx";
import ResumeScoreRadar from "./radar.jsx";
import { WorkContext } from "../../ContextAPI/WorkContext.jsx";
import { Link, useParams } from "react-router-dom";
import { 
  LayoutDashboard, 
  AlertCircle, 
  Rocket, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  Briefcase 
} from "lucide-react";

const Dashboard = () => {
  const {
    isLoggedIn,
    user,
    userSeekerData,
    getMySeekerProfile,
    fetchApplicationStatusPie,
    fetchApplicationsByCategory,
    fetchApplicationsByDate,
    fetchApplicationsByLocation,
    fetchResumeGrade,
    graphData,
    getSuggestedJobsForThisSeeker,
    suggestedJobsForThisSeeker,
  } = useContext(WorkContext);

  const { role, username } = useParams();

  // --- Sync Seeker Profile ---
  useEffect(() => {
    if (isLoggedIn) {
      getMySeekerProfile();
    }
  }, [isLoggedIn]);

  // --- Fetch Graph Data (Handles "me" alias internally) ---
  useEffect(() => {
    if (userSeekerData?._id) {
      fetchApplicationStatusPie("me");
      fetchApplicationsByDate("me");
      fetchApplicationsByCategory("me");
      fetchApplicationsByLocation("me");
      fetchResumeGrade("me");
      getSuggestedJobsForThisSeeker("me");
    }
  }, [userSeekerData?._id]);

  const navLink = `/auth/${role}/${username}`;

  // --- Safe counts & Logic ---
  const appliedCount = userSeekerData?.appliedFor?.length ?? 0;
  const savedCount = userSeekerData?.savedJobs?.length ?? 0;
  const matchCount = suggestedJobsForThisSeeker?.totalMatches ?? (suggestedJobsForThisSeeker?.suggestedJobs?.length ?? 0);
  const contactedCount = userSeekerData?.companiesContacted?.length ?? 0;

  // --- Normalize Resume Grade Object ---
  const gradeObj = (() => {
    const g = graphData?.grade;
    if (!g) return { percent: null, brief: null };
    if (typeof g === "number") return { percent: g, brief: null };
    const percent = typeof g.percent === "number" ? g.percent : typeof g.score === "number" ? g.score : null;
    const brief = g.brief && typeof g.brief === "object" ? g.brief : null;
    return { percent, brief };
  })();

  // --- RENDER: Profile Missing Drawer ---
  if (isLoggedIn && userSeekerData === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 border-t border-purple-400">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl border border-red-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Profile Required</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We couldn't find your professional seeker profile. Setup your profile to unlock AI job matching and application analytics.
          </p>
          <Link
            to={`${navLink}/enroll`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
          >
            Create Professional Profile <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 border-t border-purple-400 text-gray-800 font-sans pb-20">
      <div className="max-w-[90%] mx-auto py-8 px-4">
        
        {/* SECTION: Hero / Welcome */}
        <section className="bg-white rounded-2xl p-8 shadow-sm mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                <LayoutDashboard size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Welcome back,{" "}
                  <span className="text-purple-600">{user?.firstName ?? "Seeker"}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Snapshot of your job journey — opportunities, activity, and progress.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`${navLink}/profile`}
                className="px-5 py-2.5 border border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition text-sm shadow-sm"
              >
                View Profile
              </Link>
              <Link
                to={`${navLink}/jobs`}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition text-sm shadow-md"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION: KPI Cards (Full Original Detail) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Applications */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-colors group">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Applications Submitted</h4>
              <div className="mt-5 flex items-center gap-4">
                <div className="bg-blue-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-100">
                  {appliedCount}
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{appliedCount}</p>
                  <p className="text-xs text-gray-400 font-medium">Quick overview</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50">
              <Link to={`${navLink}/my-applications`} className="text-xs font-bold px-4 py-2 bg-transparent rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition inline-block">
                View now
              </Link>
            </div>
          </div>

          {/* Card 2: Saved Jobs */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-colors">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jobs Viewed / Saved</h4>
              <div className="mt-5 flex items-center gap-4">
                <div className="bg-emerald-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-100">
                  {savedCount}
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{savedCount}</p>
                  <p className="text-xs text-gray-400 font-medium">Quick overview</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50">
              <Link to={`${navLink}/saved-jobs`} className="text-xs font-bold px-4 py-2 bg-transparent rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition inline-block">
                View now
              </Link>
            </div>
          </div>

          {/* Card 3: Matched Jobs */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-colors">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Matched Jobs</h4>
              <div className="mt-5 flex items-center gap-4">
                <div className="bg-purple-600 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-2xl font-black shadow-lg shadow-purple-100">
                  {matchCount}
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{matchCount}</p>
                  <p className="text-xs text-gray-400 font-medium">Explore matches</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50">
              <Link to={`${navLink}/jobs`} className="text-xs font-bold px-4 py-2 bg-transparent rounded-lg border border-purple-600 text-purple-600 hover:bg-purple-50 transition inline-block">
                Explore
              </Link>
            </div>
          </div>

          {/* Card 4: Contacts */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-colors">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Companies Contacted</h4>
              <div className="mt-5 flex items-center gap-4">
                <div className="bg-orange-500 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-2xl font-black shadow-lg shadow-orange-100">
                  {contactedCount}
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{contactedCount}</p>
                  <p className="text-xs text-gray-400 font-medium">Networking info</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50">
              <Link to={`${navLink}/contacts`} className="text-xs font-bold px-4 py-2 bg-transparent rounded-lg border border-orange-600 text-orange-600 hover:bg-orange-50 transition inline-block">
                View now
              </Link>
            </div>
          </div>

        </section>

        {/* SECTION: Charts (Grid Split) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Primary Graph: Application Pipeline */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={20} className="text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Application Pipeline</h3>
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-8">
                <div className="w-full lg:w-64">
                  {graphData?.pie ? (
                    <ApplicationStatusPie data={graphData.pie} />
                  ) : (
                    <div className="h-56 w-full flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl animate-pulse font-bold">
                      Loading Pie...
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    Detailed overview of your application status — tracking recruiter views, interview shortlists, and decision trends over time.
                  </p>
                  <div className="mt-6 h-56">
                    {graphData?.line ? (
                      <ApplicationsLineChart data={graphData.line} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl animate-pulse font-bold">
                        Analyzing Activity...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Market Insight: Categories & Locations */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Market Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Industries Targeted</h4>
                  {graphData?.bar ? <JobCategoryBarChart data={graphData.bar} /> : <div className="h-44 bg-slate-50 rounded-2xl" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Location Preferences</h4>
                  {graphData?.horBar ? <LocationHorizontalBar data={graphData.horBar} /> : <div className="h-44 bg-slate-50 rounded-2xl" />}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Radar & Quick Actions */}
          <aside className="flex flex-col gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
              <h3 className="text-xl font-bold text-gray-900 mb-6 w-full">Resume Strength</h3>

              {gradeObj.brief ? (
                <div className="w-full h-64">
                  <ResumeScoreRadar data={{ brief: gradeObj.brief }} />
                </div>
              ) : gradeObj.percent !== null ? (
                <div className="flex flex-col items-center py-8">
                  <div className="rounded-full w-32 h-32 flex items-center justify-center bg-purple-50 border-4 border-purple-100 shadow-inner">
                    <div className="text-3xl font-black text-purple-600">{gradeObj.percent}%</div>
                  </div>
                  <p className="text-sm font-bold text-gray-500 mt-4">Profile Score</p>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl w-full font-bold">
                  No Data Point
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mt-4 italic font-medium">
                Evaluated based on skills, certifications, and experience density.
              </p>
            </div>

            {/* Dark Widget: Quick Actions */}
            <div className="bg-gray-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                 <Rocket size={80} />
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Rocket className="text-purple-400" size={20} /> Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 relative z-10">
                <Link to={`${navLink}/profile`} className="px-4 py-3 bg-purple-600 rounded-xl text-sm font-bold text-white text-center hover:bg-purple-700 transition shadow-lg shadow-purple-900">
                  Update Profile
                </Link>
                <Link to={`${navLink}/resume-builder`} className="px-4 py-3 bg-gray-800 rounded-xl text-sm font-bold text-white text-center border border-gray-700 hover:bg-gray-700 transition">
                  Improve Resume
                </Link>
                <Link to={`${navLink}/jobs`} className="px-4 py-3 bg-gray-800 rounded-xl text-sm font-bold text-white text-center border border-gray-700 hover:bg-gray-700 transition">
                  Browse Matches
                </Link>
              </div>
            </div>
          </aside>
        </section>

        {/* SECTION: Recent Activity (Restored Rows) */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={22} className="text-purple-600" />
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Recent Activity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
               <div>
                  <p className="font-bold text-gray-900">UI/UX Designer - Microsoft</p>
                  <p className="text-xs font-medium text-gray-400">Viewed by recruiter • 2 days ago</p>
               </div>
               <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
               <div>
                  <p className="font-bold text-gray-900">Backend Developer - Amazon</p>
                  <p className="text-xs font-medium text-gray-400">Application submitted • 3 days ago</p>
               </div>
               <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
               <div>
                  <p className="font-bold text-gray-900">Data Analyst - Swiggy</p>
                  <p className="text-xs font-medium text-gray-400">Shortlisted • 5 days ago</p>
               </div>
               <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
               <div>
                  <p className="font-bold text-gray-900">Full Stack Intern - TCS</p>
                  <p className="text-xs font-medium text-gray-400">Rejected • 6 days ago</p>
               </div>
               <div className="h-2 w-2 rounded-full bg-red-500"></div>
            </div>
          </div>
        </section>

        {/* SECTION: Suggested Jobs (Restored Cards) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Suggested Jobs for You</h3>
            <Link to={`${navLink}/jobs`} className="text-purple-600 font-bold text-sm hover:underline">Show all suggestions →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {suggestedJobsForThisSeeker?.suggestedJobs?.slice(0, 6).map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Briefcase size={20} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-purple-600 transition-colors">{item.title}</h4>
                </div>
                <p className="text-xs font-bold text-gray-400 mb-2">{item.location} • {item.jobType}</p>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed font-medium">{item.description}</p>
                <Link to={`/auth/${role}/${username}/jobs/detail/${item._id}`} className="block w-full text-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors shadow-lg shadow-slate-100">
                  Apply Now
                </Link>
              </div>
            ))}

            {!suggestedJobsForThisSeeker?.suggestedJobs?.length && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-gray-400 font-bold">No AI matches yet. Complete your profile to get tailored jobs.</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION: Progress & Recommended Upskills */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h4 className="font-bold mb-4 text-gray-900 uppercase text-xs tracking-widest">Profile Integrity</h4>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-1000"
                style={{ width: gradeObj.percent !== null ? `${gradeObj.percent}%` : "50%" }}
              />
            </div>
            <div className="mt-4 flex justify-between items-center">
               <p className="text-sm font-bold text-gray-600">Completion Score</p>
               <p className="text-xl font-black text-purple-600">{gradeObj.percent ?? "50"}%</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h4 className="font-bold mb-4 text-gray-900 uppercase text-xs tracking-widest">Recommended Upskills</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                Build projects with MongoDB aggregation
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                Practice JavaScript DSA questions
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                Learn Resume Optimization tips
              </li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
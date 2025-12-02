// SingleJob.jsx (Light SaaS theme - UI only; logic preserved)
import React, { useContext, useEffect, useState } from "react";
import {
  MoveLeftIcon,
  Briefcase,
  MapPin,
  IndianRupee,
  PenTool,
  Book,
  Text,
  Globe,
  Save,
} from "lucide-react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { Link, useNavigate, useParams } from "react-router-dom";

const MetaBadge = ({ children }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gray-50 border border-gray-100 text-gray-700">
    {children}
  </span>
);

const KeyValue = ({ k, v }) => (
  <div className="flex gap-3 items-start">
    <div className="text-sm text-gray-500 w-36">{k}</div>
    <div className="text-sm text-gray-800">{v ?? "—"}</div>
  </div>
);

const SingleJob = () => {
  const { userId, jobId } = useParams();
  const navigate = useNavigate();

  const {
    getSingleJobById,
    singleJob,
    convertToStandardDateTime,
    getAuthorityByID,
    oneAuthData,
    getApplicantByJobAndCompanyId,
    singleApplicantData,
    applyForJob,
    applicant_id,
    getSeekerDataByUserId,
    user_seekerData,
    saveJob,
  } = useContext(WorkContext);

  // fetch job
  useEffect(() => {
    if (jobId) getSingleJobById(jobId);
  }, [jobId, getSingleJobById]);

  // fetch seeker
  useEffect(() => {
    if (userId) getSeekerDataByUserId(userId);
  }, [userId, getSeekerDataByUserId]);

  // fetch authority (company / posted by)
  useEffect(() => {
    if (singleJob && singleJob.postedBy) {
      getAuthorityByID(singleJob.postedBy);
    }
  }, [singleJob, getAuthorityByID]);

  // fetch applicants for company & job
  useEffect(() => {
    if (oneAuthData?.postedBy && singleJob?._id) {
      getApplicantByJobAndCompanyId(oneAuthData.postedBy, singleJob._id);
    }
  }, [oneAuthData, singleJob, getApplicantByJobAndCompanyId]);

  // local save/apply toggles (preserve your existing behavior)
  const [save, setSave] = useState(false);
  useEffect(() => {
    const saveThisJob = async () => {
      if (user_seekerData?._id && jobId && save) {
        await saveJob(user_seekerData._id, jobId);
      }
    };
    saveThisJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save]);

  const [apply, setApply] = useState(false);
  useEffect(() => {
    const applyAndRedirect = async () => {
      if (user_seekerData?._id && jobId && apply) {
        await applyForJob(jobId, user_seekerData._id);
        navigate(`/auth/seeker/${userId}/jobs`);
      }
    };
    applyAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apply]);

  const handleGoBack = () => navigate(`/auth/seeker/${userId}/jobs`);

  // small safe helpers
  const jobTitle = singleJob?.title ?? "Job details";
  const initials = jobTitle?.trim()?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-[1100px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleGoBack}
            aria-label="Back"
            className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow transition"
          >
            <MoveLeftIcon className="w-5 h-5 text-gray-700" />
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Job details</h1>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT / MAIN (col-span-2 on desktop) */}
          <main className="lg:col-span-2 space-y-6">
            {/* Job header card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-violet-400 flex items-center justify-center text-white text-3xl font-bold">
                    {initials}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900">{jobTitle}</h2>

                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    <MetaBadge>
                      <Briefcase className="w-4 h-4 text-gray-600" />
                      {singleJob?.jobRole ?? "—"}
                    </MetaBadge>

                    <MetaBadge>
                      <MapPin className="w-4 h-4 text-gray-600" />
                      {singleJob?.location ?? "Remote"}
                    </MetaBadge>

                    <MetaBadge>
                      <IndianRupee className="w-4 h-4 text-gray-600" />
                      {singleJob?.salaryRange ?? "—"}
                    </MetaBadge>

                    <MetaBadge>
                      <Book className="w-4 h-4 text-gray-600" />
                      {singleJob?.experienceRequired ?? "—"}
                    </MetaBadge>
                  </div>
                </div>
              </div>
            </div>

            {/* Description card */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Job description</h3>

              <div className="space-y-2 text-sm text-gray-700">
                <KeyValue k="Role" v={singleJob?.jobRole} />
                <KeyValue k="Type" v={singleJob?.jobType} />
                <KeyValue k="Experience" v={singleJob?.experienceRequired} />
                <KeyValue k="Location" v={singleJob?.location} />
                <KeyValue k="Salary" v={singleJob?.salaryRange} />
                <KeyValue k="Seats" v={singleJob?.totalSeats} />
              </div>

              <div className="pt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">About this role</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{singleJob?.description ?? "No description provided."}</p>
              </div>
            </section>

            {/* Skills & Important dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Skills required</h4>
                <div className="flex flex-wrap gap-2">
                  {singleJob?.skillsRequired?.length ? (
                    singleJob.skillsRequired.map((s, i) => (
                      <span key={i} className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
                        {s}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills listed.</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Important dates</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    <div className="text-xs text-gray-500">Posted on</div>
                    <div className="text-sm text-gray-900">{convertToStandardDateTime(singleJob?.createdAt) || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Apply before</div>
                    <div className="text-sm text-gray-900">{convertToStandardDateTime(singleJob?.deadline) || "—"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicants preview (if present) */}
            {singleApplicantData?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Applicants (preview)</h4>
                <div className="space-y-2 text-sm">
                  {singleApplicantData.slice(0, 5).map((app, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-700">
                          {app?.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app?.name ?? "Unknown"}</div>
                          <div className="text-xs text-gray-500">{app?.email}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{convertToStandardDateTime(app?.appliedAt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* RIGHT / SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Apply card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div>
                  <div className="text-xs text-gray-500">Openings</div>
                  <div className="text-lg font-semibold text-gray-900">{singleJob?.totalSeats ?? "—"}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Applicants</div>
                  <div className="text-lg font-semibold text-gray-900">{singleApplicantData?.length ?? 0}</div>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <button
                    onClick={() => setApply(true)}
                    disabled={apply}
                    className={`w-full px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm transition ${
                      apply ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {apply ? "Applied" : "Apply Now"}
                  </button>

                  <button
                    onClick={() => setSave((s) => !s)}
                    className="w-full px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50"
                  >
                    <Save className="w-4 h-4 text-gray-600" />
                    {save ? "Saved" : "Save Job"}
                  </button>
                </div>
              </div>

              {/* Company card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                    <img src={oneAuthData?.companyLogo} alt={oneAuthData?.companyName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{oneAuthData?.companyName ?? "Company"}</div>
                    <div className="text-xs text-gray-500">{oneAuthData?.industry}</div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mt-3">{oneAuthData?.about ? truncate(oneAuthData.about, 180) : "No company description"}</p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <a href={oneAuthData?.companyWebsite} target="_blank" rel="noreferrer" className="text-sm text-purple-600 hover:underline">
                    Visit website
                  </a>
                  <Link to={`/auth/seeker/${userId}/profile`} className="text-sm text-gray-600 hover:underline">
                    View profiles
                  </Link>
                </div>
              </div>

              {/* Contact card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span>Website</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-900">{oneAuthData?.companyWebsite ?? "—"}</div>

                  <div className="mt-3 text-xs text-gray-500">Contact</div>
                  <div className="text-sm text-gray-900">{oneAuthData?.contactNumber ?? "—"}</div>
                  <div className="mt-2 text-xs text-gray-500">Email</div>
                  <div className="text-sm text-gray-900">{oneAuthData?.companyEmail ?? "—"}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

// small util
function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export default SingleJob;

// SavedJobs.jsx — Light SaaS Theme (UI only)
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MoveLeftIcon } from "lucide-react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import JobCard from "../Components/JobCard";

const SavedJobs = () => {
  const {
    getUserIdByToken,
    globalId,
    getAllSavedJobs,
    savedJobsForThisUser,
    getSeekerDataByUserId,
    user_seekerData,
  } = useContext(WorkContext);

  const { hash } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // user ID
  useEffect(() => {
    getUserIdByToken();
  }, [hash]);

  // seeker details
  useEffect(() => {
    if (globalId) getSeekerDataByUserId(globalId);
  }, [globalId]);

  // saved jobs
  useEffect(() => {
    if (user_seekerData?._id) {
      (async () => {
        await getAllSavedJobs(user_seekerData._id);
        setLoading(false);
      })();
    }
  }, [user_seekerData]);

  const handleGoBack = () => navigate(`/auth/seeker/${hash}/jobs`);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-[1100px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleGoBack}
            aria-label="Back"
            className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow transition"
          >
            <MoveLeftIcon className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 text-gray-500">
            Loading your saved jobs...
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          (!savedJobsForThisUser || savedJobsForThisUser.length === 0) && (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No Saved Jobs Yet
              </h2>
              <p className="text-gray-600 mb-4">
                Jobs you save will appear here for quick access later.
              </p>
              <button
                onClick={() => navigate(`/auth/seeker/${hash}/jobs`)}
                className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
              >
                Browse Jobs
              </button>
            </div>
          )}

        {/* Saved Jobs Grid */}
        {!loading && savedJobsForThisUser?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {savedJobsForThisUser.map((item) => (
              <JobCard key={item?._id} job={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;

import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MoveLeftIcon, Bookmark, Search } from "lucide-react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import JobCard from "../Components/JobCard";
import Bottom from "../../Authority/Components/Bottom";

const SavedJobs = () => {
  const {
    isLoggedIn,
    user,
    getMySeekerProfile,
    userSeekerData,
    getAllSavedJobs,
    savedJobsForThisUser = [],
  } = useContext(WorkContext);

  // Params from your new route structure
  const { role, username } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // 1. Ensure seeker profile is loaded first (Implicit via Cookie)
  useEffect(() => {
    if (isLoggedIn && !userSeekerData) {
      getMySeekerProfile();
    }
  }, [isLoggedIn]);

  // 2. Fetch saved jobs once the seeker profile ID is available
  useEffect(() => {
    const fetchSaved = async () => {
      if (userSeekerData?._id) {
        setLoading(true);
        await getAllSavedJobs(); // Backend now pulls identity from req.user
        setLoading(false);
      }
    };
    fetchSaved();
  }, [userSeekerData]);

  // 3. Dynamic Navigation Path
  const navPath = `/auth/${role}/${username}`;

  const handleGoBack = () => navigate(`${navPath}/jobs`);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow py-10">
        <div className="max-w-[1100px] mx-auto px-4">
          
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
              >
                <MoveLeftIcon className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Saved Jobs</h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Your Personal Shortlist
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                <Bookmark size={16} className="text-purple-600" />
                <span className="text-sm font-bold text-purple-700">{savedJobsForThisUser.length} Jobs Saved</span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-bold animate-pulse text-sm">Synchronizing your shortlist...</p>
            </div>
          ) : (
            <>
              {/* Empty State */}
              {savedJobsForThisUser.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-16 text-center shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Bookmark size={32} className="text-gray-300" />
                  </div>
                  <h2 className="text-xl font-black text-gray-800 mb-2">
                    Your shortlist is empty
                  </h2>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
                    Save interesting opportunities while browsing to keep them organized here.
                  </p>
                  <button
                    onClick={() => navigate(`${navPath}/jobs`)}
                    className="px-8 py-3 bg-purple-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                  >
                    <Search size={18} /> Explore Jobs
                  </button>
                </div>
              ) : (
                /* Saved Jobs Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {savedJobsForThisUser.map((item) => (
                    <JobCard key={item?._id} job={item} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Bottom />
    </div>
  );
};

export default SavedJobs;
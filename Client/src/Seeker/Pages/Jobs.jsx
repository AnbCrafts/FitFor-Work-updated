import React, { useContext, useEffect, useState } from "react";
import JobCard from "../Components/JobCard";
import Filters from "../Components/Filters";
import ApplySteps from "../Components/ApplySteps";
import Bottom from "../Components/Bottom";
import PageNav from "../../Global/Components/PageNav";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { Link } from "react-router-dom";
import { Search, MapPin, Briefcase, Filter, X } from "lucide-react";

const Jobs = () => {
  const { 
    isLoggedIn,
    user,
    getAllJobsFromDB,
    allJobs = [],
    getAllRequirementsForJob,
    requirements = {},
    allJobCategories = [],
    getAllJobCategories,
    getMySeekerProfile,
    userSeekerData,
    totalJobPages , // From Context metadata
    currentJobPage ,setCurrentJobPage // From Context metadata
  } = useContext(WorkContext);

  // --- [STATE: SEARCH & FILTER PARAMS] ---
  // --- [STATE: SEARCH & FILTER PARAMS] ---
  const [queryParams, setQueryParams] = useState({
    page: 1, // Start at page 1
    limit: 5,
    search: "",
    category: "",
    location: "",
    jobType: "",
    experience: ""
  });

  // --- [EFFECT: INITIAL LOAD] ---
  useEffect(() => {
    getAllJobCategories();
    getAllRequirementsForJob();
    if (isLoggedIn && !userSeekerData) {
      getMySeekerProfile();
    }
  }, [isLoggedIn]); // Removed unnecessary dependencies to prevent loops

  // --- [EFFECT: FETCH JOBS ON PARAM CHANGE] ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Pass the local queryParams directly to the API fetcher
      getAllJobsFromDB(queryParams);
    }, 400); 

    return () => clearTimeout(delayDebounceFn);
  }, [queryParams]); // getAllJobsFromDB removed from deps to prevent re-renders

  // --- [HANDLERS] ---
  const handleParamChange = (name, value) => {
    // When a filter changes, we MUST reset page to 1
    setQueryParams(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (pageNumber) => {
    // Update local state, which triggers the useEffect above
    setQueryParams(prev => ({ ...prev, page: pageNumber }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setQueryParams({
      page: 1,
      limit: 5,
      search: "",
      category: "",
      location: "",
      jobType: "",
      experience: ""
    });
  };

  const navPath = isLoggedIn && user 
    ? `/auth/${user.role?.toLowerCase()}/${user.username}` 
    : "";

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 1. SMART SEARCH HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1350px] mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            
            {/* Search Input */}
            <div className="flex-1 relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors pointer-events-none z-10" size={18} />
              <input 
                name="search"
                value={queryParams.search}
                onChange={(e) => handleParamChange("search", e.target.value)}
                placeholder="Search job titles, skills, or keywords..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-gray-700"
              />
            </div>

            {/* Category Dropdown (Uses _id mapping) */}
            <div className="w-full lg:w-64 relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
              <select 
                value={queryParams.category}
                onChange={(e) => handleParamChange("category", e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 appearance-none bg-white focus:border-purple-500 outline-none transition-all text-gray-700 cursor-pointer"
              >
                <option value="">All Categories</option>
                {requirements?.categories?.filter(c => c._id !== null).map((cat, i) => (
                  <option key={i} value={cat._id}>{cat._id}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Location Input */}
            <div className="w-full lg:w-56 relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
              <input 
                placeholder="Location"
                value={queryParams.location}
                onChange={(e) => handleParamChange("location", e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all"
              />
            </div>

            <button 
              onClick={clearFilters}
              className="px-6 py-3 text-gray-500 hover:text-red-500 flex items-center justify-center gap-2 font-semibold transition group"
            >
              <X size={18} className="group-hover:rotate-90 transition-transform" /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1350px] mx-auto px-4 mt-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* 2. LEFT — SIDEBAR FILTERS */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-32 space-y-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Filters</h3>
                <Filter size={16} className="text-purple-600" />
              </div>

              {/* 1. Job Type */}
              <Filters 
                head="Employment Type" 
                options={requirements?.jobTypes?.filter(t => t._id !== null) || []} 
                onFilterChange={(h, val, checked) => handleParamChange('jobType', checked ? val._id : '')}
              />

              {/* 2. Location */}
              {requirements?.locations && (
                <Filters 
                  head="Location" 
                  options={requirements.locations.filter(l => l._id !== null)} 
                  onFilterChange={(h, val, checked) => handleParamChange('location', checked ? val._id : '')}
                />
              )}

              {/* 3. Category */}
              {requirements?.categories && (
                <Filters 
                  head="Industry" 
                  options={requirements.categories.filter(c => c._id !== null)} 
                  onFilterChange={(h, val, checked) => handleParamChange('category', checked ? val._id : '')}
                />
              )}

              {/* 4. Experience Level */}
              {requirements?.skills && (
                <Filters 
                  head="Experience Level" 
                  options={requirements?.experience || []} 
                  onFilterChange={(h, val, checked) => handleParamChange('experience', checked ? val._id : '')}
                />
              )}

              <ApplySteps />
            </div>
          </aside>

          {/* 3. MAIN — JOBS LIST */}
          <main className="col-span-12 lg:col-span-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Current Opportunities 
                <span className="text-purple-600 text-sm font-normal ml-2">
                  (Showing Page {currentJobPage} of {totalJobPages})
                </span>
              </h2>
            </div>

            <div className="space-y-6">
              {allJobs.length > 0 ? (
                allJobs.map((job) => <JobCard key={job._id} job={job} />)
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                  <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                    <Search size={28} />
                  </div>
                  <p className="text-gray-900 font-bold text-lg">No jobs found matching your criteria</p>
                  <p className="text-gray-500 mt-1">Try broadening your search or resetting filters.</p>
                </div>
              )}
            </div>

            {/* SERVER-SIDE PAGINATION - FIXED LOGIC */}
            {totalJobPages >= 1 && (
              <div className="mt-12 flex justify-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <PageNav 
                  currentPage={currentJobPage} 
                  totalPages={totalJobPages} 
                  incrementer={handlePageChange} 
                />
              </div>
            )}
          </main>

          {/* 4. RIGHT — USER UTILITIES */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="sticky top-32 space-y-6">
              {isLoggedIn && user && (
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
                  <h4 className="font-bold text-lg mb-2">My Career Hub</h4>
                  <p className="text-purple-100 text-sm mb-4">Quick access to your applications and profile.</p>
                  <div className="space-y-2">
                    <Link to={`${navPath}/dashboard`} className="block w-full py-2.5 bg-white/10 hover:bg-white/20 text-center rounded-lg transition text-sm backdrop-blur-md font-medium border border-white/20">
                      Go to Dashboard
                    </Link>
                    <Link to={`${navPath}/saved-jobs`} className="block w-full py-2 text-center rounded-lg transition text-sm hover:underline">
                      View Saved Jobs
                    </Link>
                  </div>
                </div>
              )}
              
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                 <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Recommended Skills</h4>
                 <div className="flex flex-wrap gap-2">
                    {requirements?.skills?.slice(0, 15).map((skill, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600 font-medium"
                      >
                        {skill._id}
                      </span>
                    ))}
                 </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Bottom />
    </div>
  );
};

export default Jobs;
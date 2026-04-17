import React, { useContext, useEffect, useState } from "react";
import {
  MoveLeftIcon,
  Briefcase,
  MapPin,
  IndianRupee,
  Book,
  Globe,
  Save,
  CheckCircle,
  Building2,
  Calendar,
  Users,
  ShieldCheck,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import Bottom from "../../Authority/Components/Bottom";

const MetaBadge = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
    <Icon size={16} className="text-purple-600" />
    <span className="text-sm font-semibold text-gray-700">{children}</span>
  </div>
);

const SingleJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const {
    getSingleJobById,
    singleJob,
    convertToStandardDateTime,
    getAuthorityByID,
    oneAuthData,
    applyForJob,
    user,
    isLoggedIn,
    getMySeekerProfile,
    userSeekerData,
    saveJob
  } = useContext(WorkContext);

  const [isApplying, setIsApplying] = useState(false);

  // 1. Initial Job Fetch
  useEffect(() => {
    if (jobId) getSingleJobById(jobId);
  }, [jobId]);

  // 2. Fetch Seeker Profile (Implicit)
  useEffect(() => {
    if (isLoggedIn && !userSeekerData) getMySeekerProfile();
  }, [isLoggedIn]);

  // 3. Fetch Company Data
  useEffect(() => {
    if (singleJob?.postedBy) {
      const creatorId = typeof singleJob.postedBy === 'object' ? singleJob.postedBy._id : singleJob.postedBy;
      getAuthorityByID(creatorId);
    }
  }, [singleJob]);

  // Helpers
  const userRole = user?.role?.toLowerCase() || "";
  const userName = user?.username || "";
  const navPath = isLoggedIn && userRole && userName ? `/auth/${userRole}/${userName}` : "";

  // CHECK EXPIRATION
  const isExpired = singleJob?.deadline ? new Date(singleJob.deadline) < new Date() : false;

  const hasApplied = singleJob?.applicants?.some(appId => 
     appId === userSeekerData?._id || appId?._id === userSeekerData?._id
  );

  const handleApply = async () => {
    if (!isLoggedIn) return navigate("/enroll");
    if (isExpired) return;

    setIsApplying(true);
    try {
      const success = await applyForJob(jobId);
      if (success && navPath) navigate(`${navPath}/jobs`);
    } catch (error) {
        console.error("UI Error:", error);
    } finally {
        // This ensures the button resets even if the API or toast crashes
        setIsApplying(false);
    }
  };

  if (!singleJob) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4 text-purple-600 font-bold">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="animate-pulse">Analyzing Listing...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFB] pb-20 font-sans">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold transition-all"
          >
            <div className="p-2 rounded-xl group-hover:bg-purple-50 transition-colors">
              <MoveLeftIcon size={20} />
            </div>
            Back to Marketplace
          </button>
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-blue-500" size={20} />
            <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Verified Listing</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        
        {/* EXPIRED WARNING MESSAGE */}
        {isExpired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-2 bg-red-100 rounded-xl text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="font-black text-red-800 text-sm uppercase tracking-widest">Listing Expired</p>
              <p className="text-red-600 text-xs font-medium">The application period for this position has ended on {convertToStandardDateTime(singleJob.deadline)}.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* HERO CARD */}
            <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-2xl shadow-purple-900/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[5rem] -z-0 opacity-50"></div>
               <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl">
                      {singleJob.title?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-6">{singleJob.title}</h1>
                      <div className="flex flex-wrap gap-3">
                        <MetaBadge icon={Briefcase}>{singleJob.jobRole}</MetaBadge>
                        <MetaBadge icon={MapPin}>{singleJob.location}</MetaBadge>
                        <MetaBadge icon={IndianRupee}>{singleJob.salaryRange}</MetaBadge>
                        <MetaBadge icon={Book}>{singleJob.experienceRequired}</MetaBadge>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
                Executive Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-12">
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Briefcase size={14}/>
                    <p className="text-[10px] font-black uppercase tracking-widest">Employment</p>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{singleJob.jobType}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Users size={14}/>
                    <p className="text-[10px] font-black uppercase tracking-widest">Category</p>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{singleJob.category}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Users size={14}/>
                    <p className="text-[10px] font-black uppercase tracking-widest">Vacancies</p>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{singleJob.totalSeats} Openings</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest text-purple-600">Job Intelligence</h4>
                <p className="text-gray-600 leading-loose text-lg whitespace-pre-line font-medium">
                  {singleJob.description}
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 relative">
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-white">
                 <div className="bg-gray-50 rounded-3xl p-6 mb-8 flex justify-around">
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-900">{singleJob.applicationCount || 0}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Applicants</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200"></div>
                    <div className="text-center">
                      <p className={`text-2xl font-black ${isExpired ? 'text-red-500' : 'text-purple-600'}`}>
                        {isExpired ? "Closed" : "Active"}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <button 
                      onClick={handleApply}
                      disabled={hasApplied || isApplying || isExpired}
                      className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                        isExpired 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        : hasApplied 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-purple-200 active:scale-95"
                      }`}
                    >
                      {isExpired ? "Expired" : hasApplied ? <><CheckCircle size={20} /> Applied</> : isApplying ? "Finalizing..." : "Apply to Position"}
                    </button>
                    
                    <button 
                       onClick={() => saveJob(jobId)}
                       className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 border border-gray-100 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Save for Later
                    </button>
                 </div>

                 <div className="mt-12 pt-8 border-t border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Employer Information</h4>
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden p-3 shadow-inner">
                        {oneAuthData?.companyLogo ? (
                          <img src={oneAuthData.companyLogo} className="w-full h-full object-contain" alt="Logo" />
                        ) : (
                          <Building2 className="text-gray-300" size={30} />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg leading-tight">{oneAuthData?.companyName || "Verified Employer"}</p>
                        <p className="text-xs text-purple-600 font-black uppercase tracking-tighter">{oneAuthData?.industry || "Marketplace Partner"}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium italic">
                      "{oneAuthData?.about || "This employer profile is currently being finalized."}"
                    </p>
                    <div className="flex items-center justify-between">
                      <a href={oneAuthData?.companyWebsite} target="_blank" className="flex items-center gap-2 text-xs font-black text-purple-600 hover:underline">
                        <Globe size={14} /> Official Site
                      </a>
                      <Link to={`${navPath}/companies`} className="text-xs font-black text-gray-300 hover:text-purple-600 transition">More Companies</Link>
                    </div>
                 </div>
              </div>

              <div className={`${isExpired ? 'bg-red-600' : 'bg-indigo-900'} rounded-[2rem] p-8 text-white shadow-xl transition-colors`}>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      <Calendar size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Deadline</p>
                      <p className="font-bold text-lg">{convertToStandardDateTime(singleJob.deadline)}</p>
                    </div>
                 </div>
                 <p className="text-xs opacity-80 font-medium leading-relaxed">
                   {isExpired ? "Applications for this role are now closed." : "Please ensure all required documents are attached before the cutoff."}
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Bottom />
    </div>
  );
};

export default SingleJob;
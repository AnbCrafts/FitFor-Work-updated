import React, { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { FaTools } from "react-icons/fa";
import Applicant from "./Applicant";
import Employee from "./Employee";
// Importing more icons for a professional SaaS look
import { 
  MoveLeft, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle2,
  FileText
} from "lucide-react";

const SingleJob = () => {
  const { hash, jobId } = useParams();
  const {
    getSingleJobById,
    singleJob,
    convertToStandardDateTime,
    getApplicantsByJobId,
  } = useContext(WorkContext);
  const navigate = useNavigate();

  useEffect(() => {
    getSingleJobById(jobId);
  }, [jobId]);

  // FIX: Added dependency array [singleJob] to prevent infinite re-renders
  useEffect(() => {
    if (singleJob && singleJob?._id) {
      getApplicantsByJobId(singleJob?._id);
    }
  }, [singleJob?._id]);

  const handleGoBack = () => {
    navigate("/auth/authority/" + hash + "/profile");
  };

  // Helper component for Job Details row
  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* --- Header Section --- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            >
              <MoveLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">Job Overview</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* --- Top Banner / Title Card --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-800">{singleJob?.title}</h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                singleJob?.status === 'active' // Assuming active status logic
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {singleJob?.status || 'Active'}
              </span>
            </div>
            <p className="text-slate-500 flex items-center gap-2">
              <Calendar size={16} /> Posted on {convertToStandardDateTime(singleJob?.createdAt)}
            </p>
          </div>
        </div>

        {/* --- Main Grid Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left Column (Main Content) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">Job Description</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                {singleJob?.description}
              </div>
            </div>

            {/* Applicants Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
                <h2 className="text-lg font-bold text-slate-800">Applicants</h2>
                <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">
                  {singleJob?.applicants?.length || 0} Candidates
                </span>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  {singleJob && singleJob.applicants && singleJob.applicants.length > 0 ? (
                    singleJob.applicants.map((item, index) => (
                      <Applicant key={item._id || index} id={item} />
                    ))
                  ) : (
                    <div className="w-full text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-slate-400">No applicants yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Employees Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-green-50/30">
                <h2 className="text-lg font-bold text-slate-800">Accepted Employees</h2>
                <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">
                  {singleJob?.employees?.length || 0} Hired
                </span>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  {singleJob && singleJob.employees && singleJob.employees.length > 0 ? (
                    singleJob.employees.map((item, index) => (
                      <Employee key={item._id || index} id={item} />
                    ))
                  ) : (
                    <div className="w-full text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-slate-400">No employees hired yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* --- Right Column (Sidebar Details) --- */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Job Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Job Details
              </h3>
              <div className="space-y-1">
                <DetailRow icon={Briefcase} label="Role" value={singleJob?.jobRole} />
                <DetailRow icon={CheckCircle2} label="Type" value={singleJob?.jobType} />
                <DetailRow icon={MapPin} label="Location" value={singleJob?.location} />
                <DetailRow icon={DollarSign} label="Salary" value={singleJob?.salaryRange} />
                <DetailRow icon={Clock} label="Experience" value={singleJob?.experienceRequired} />
                <DetailRow icon={Users} label="Seats Available" value={singleJob?.totalSeats} />
                <DetailRow 
                  icon={Calendar} 
                  label="Deadline" 
                  value={convertToStandardDateTime(singleJob?.deadline)} 
                />
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {singleJob?.skillsRequired?.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-50 text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-default"
                  >
                    <FaTools size={12} className="text-indigo-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleJob;
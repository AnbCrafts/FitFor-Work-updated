import React from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Award, 
  Globe, 
  FileText, 
  Link as LinkIcon, 
  CheckCircle,
  Clock,
  Building2
} from "lucide-react";

const CustomApplicant = ({ data }) => {
  if (!data) return null;

  const {
    desiredPost,
    status,
    skills,
    experience,
    qualifications,
    certifications,
    achievements,
    languagesKnown,
    portfolioLink,
    resume,
    preferredLocation,
    preferredJobType,
    currentCompany,
    currentPost,
    currentCTC,
    expectedCTC,
    availableFrom,
    createdAt,
    updatedAt
  } = data;

  // Helper to check if array has valid data
  const hasData = (arr) => arr?.length > 0 && arr[0] !== 'None';

  // Reusable Info Item Component
  const DetailItem = ({ icon: Icon, label, value, subValue }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-slate-800 font-semibold">{value || "N/A"}</p>
        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 transition-all hover:shadow-md mb-5">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              {desiredPost}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
              status === "Experienced" 
                ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                : "bg-green-50 text-green-700 border-green-200"
            }`}>
              {status}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Clock size={14}/> Applied: {createdAt?.slice(0, 10)}</span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span>Updated: {updatedAt?.slice(0, 10)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full md:w-auto">
          {portfolioLink && (
            <a href={portfolioLink} target="_blank" rel="noopener noreferrer" 
               className="p-2.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg border border-slate-200 hover:border-purple-200 transition-all" title="View Portfolio">
              <LinkIcon size={20} />
            </a>
          )}
          {resume && (
            <a href={resume} target="_blank" rel="noopener noreferrer" 
               className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-purple-400 hover:text-purple-700 transition-all">
              <FileText size={18} /> Resume
            </a>
          )}
          <button className="flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg shadow-purple-200 transition-all">
            Hire Applicant
          </button>
        </div>
      </div>

      {/* --- GRID DETAILS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DetailItem icon={Building2} label="Current Role" value={currentPost} subValue={currentCompany} />
        <DetailItem icon={Calendar} label="Experience" value={`${experience} Years`} subValue={`Avail: ${availableFrom?.slice(0, 10)}`} />
        <DetailItem icon={DollarSign} label="Compensation" value={`₹${currentCTC} (Current)`} subValue={`₹${expectedCTC} (Expected)`} />
        <DetailItem icon={MapPin} label="Preferences" value={preferredLocation} subValue={preferredJobType} />
      </div>

      {/* --- CONTENT BLOCKS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Skills & Languages */}
        <div className="space-y-6">
          
          {/* Skills */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-purple-500"/> Core Competencies
            </h3>
            {hasData(skills) ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((item, idx) => (
                  <span key={idx} className="px-3 py-1.5 text-sm font-medium bg-slate-50 text-slate-700 border border-slate-200 rounded-full hover:border-purple-300 hover:text-purple-700 transition-colors cursor-default">
                    {item.trim()}
                  </span>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400 italic">No specific skills listed.</p>}
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-3">
              <Globe size={16} className="text-blue-500"/> Languages
            </h3>
            {hasData(languagesKnown) ? (
              <div className="flex flex-wrap gap-2">
                {languagesKnown.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md">
                    {item.trim()}
                  </span>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400 italic">None listed.</p>}
          </div>
        </div>

        {/* Right Column: Achievements & Certs (List View) */}
        <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 space-y-6">
          
          {/* Qualifications */}
          <div>
             <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-2">
              <Award size={16} className="text-orange-500"/> Qualifications
            </h3>
            <p className="text-sm text-slate-700 font-medium pl-6">{qualifications}</p>
          </div>

          {/* Certifications */}
          {hasData(certifications) && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-2">
                <Award size={16} className="text-purple-500"/> Certifications
              </h3>
              <ul className="space-y-2 pl-6">
                {certifications.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-700 list-disc marker:text-purple-300">
                    {item.trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievements */}
          {hasData(achievements) && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 mb-2">
                <Award size={16} className="text-yellow-500"/> Key Achievements
              </h3>
              <ul className="space-y-2 pl-6">
                {achievements.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-700 list-disc marker:text-yellow-400">
                    {item.trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomApplicant;
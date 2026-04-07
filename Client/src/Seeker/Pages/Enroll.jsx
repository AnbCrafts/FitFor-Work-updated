import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { 
  File, Upload, X, Briefcase, User as UserIcon, 
  MapPin, Link as LinkIcon, Award, Globe, 
  ChevronRight, ChevronLeft, CheckCircle2 
} from "lucide-react";

const Enroll = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const { createSeekerProfile, isLoggedIn, user } = useContext(WorkContext);

  const [formData, setFormData] = useState({
    desiredPost: "",
    status: "Fresher",
    skills: "",
    experience: 0,
    qualifications: "",
    resume: null,
    preferredLocation: "",
    preferredJobType: "Office",
    availableFrom: "",
    currentCompany: "None",
    currentPost: "None",
    currentCTC: 0,
    expectedCTC: 0,
    portfolioLink: "",
    certifications: "",
    languagesKnown: "",
    achievements: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, resume: file }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    const arrayFields = ["skills", "certifications", "languagesKnown", "achievements"];
    
    Object.keys(formData).forEach((key) => {
      if (arrayFields.includes(key)) {
        const arrayData = formData[key].split(",").map(item => item.trim()).filter(i => i !== "");
        data.append(key, JSON.stringify(arrayData));
      } else {
        data.append(key, formData[key]);
      }
    });

    const success = await createSeekerProfile(data);
    if (success) {
      alert("Professional profile created successfully!");
      navigate(`/auth/seeker/${user?.username || username}`);
    }
  };

  // --- Step Progress Component ---
  const ProgressBar = () => (
    <div className="flex items-center justify-between mb-12 relative px-4">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-purple-600 -translate-y-1/2 z-0 transition-all duration-500"
        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
      ></div>
      {[1, 2, 3, 4].map((step) => (
        <div 
          key={step} 
          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 ${
            currentStep >= step ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-slate-300 text-slate-400"
          }`}
        >
          {currentStep > step ? <CheckCircle2 size={20} /> : step}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Step {currentStep}: <span className="text-purple-600">
              {currentStep === 1 && "Personal Identity"}
              {currentStep === 2 && "Experience & Education"}
              {currentStep === 3 && "Preferences"}
              {currentStep === 4 && "Final Touches"}
            </span>
          </h1>
        </div>

        <ProgressBar />

        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-3xl border border-slate-100 p-8 md:p-10 min-h-[450px] flex flex-col justify-between">
          
          <div className="transition-all duration-300 animate-in fade-in slide-in-from-right-4">
            {/* STEP 1: BASIC INFO */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserIcon className="text-purple-600" size={20} />
                  <h2 className="text-xl font-bold text-slate-800">Basic Professional Info</h2>
                </div>
                <InputGroup label="Desired Role / Post" name="desiredPost" value={formData.desiredPost} onChange={handleChange} placeholder="e.g. Full Stack Developer" required />
                <SelectGroup label="Employment Status" name="status" value={formData.status} onChange={handleChange} options={["Fresher", "Experienced", "Student"]} />
                <InputGroup label="Core Skills (comma-separated)" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB..." required />
              </div>
            )}

            {/* STEP 2: EXPERIENCE */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="text-purple-600" size={20} />
                  <h2 className="text-xl font-bold text-slate-800">Experience & Education</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Experience (Years)" name="experience" type="number" value={formData.experience} onChange={handleChange} />
                  <InputGroup label="Highest Qualification" name="qualifications" value={formData.qualifications} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Resume / CV (PDF)</label>
                  {!formData.resume ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-200 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100 transition-all">
                      <Upload className="text-purple-600 mb-2" />
                      <span className="text-sm font-medium text-purple-700">Upload CV</span>
                      <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                      <p className="text-emerald-700 text-sm font-medium truncate">{formData.resume.name}</p>
                      <X className="text-red-500 cursor-pointer" onClick={() => setFormData({...formData, resume: null})} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: PREFERENCES */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-purple-600" size={20} />
                  <h2 className="text-xl font-bold text-slate-800">Work Preferences</h2>
                </div>
                <InputGroup label="Preferred Location" name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} placeholder="e.g. Remote, Bangalore" required />
                <div className="grid grid-cols-2 gap-4">
                  <SelectGroup label="Work Mode" name="preferredJobType" value={formData.preferredJobType} onChange={handleChange} options={["Office", "Remote", "Hybrid"]} />
                  <InputGroup type="date" label="Available From" name="availableFrom" value={formData.availableFrom} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Current CTC (LPA)" name="currentCTC" type="number" value={formData.currentCTC} onChange={handleChange} />
                  <InputGroup label="Expected CTC (LPA)" name="expectedCTC" type="number" value={formData.expectedCTC} onChange={handleChange} required />
                </div>
              </div>
            )}

            {/* STEP 4: LINKS & EXTRAS */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <LinkIcon className="text-purple-600" size={20} />
                  <h2 className="text-xl font-bold text-slate-800">Portfolio & Accomplishments</h2>
                </div>
                <InputGroup label="Portfolio / Website Link" name="portfolioLink" value={formData.portfolioLink} onChange={handleChange} placeholder="https://..." />
                <InputGroup label="Certifications (comma-separated)" name="certifications" value={formData.certifications} onChange={handleChange} />
                <InputGroup label="Languages (comma-separated)" name="languagesKnown" value={formData.languagesKnown} onChange={handleChange} required />
                <InputGroup label="Achievements" name="achievements" value={formData.achievements} onChange={handleChange} />
              </div>
            )}
          </div>

          {/* NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition ${
                currentStep === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ChevronLeft size={20} /> Back
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition"
              >
                Next Step <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition"
              >
                Submit Profile <CheckCircle2 size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Sub-components kept for clean logic ---
const InputGroup = ({ label, ...rest }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    <input {...rest} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all" />
  </div>
);

const SelectGroup = ({ label, options, ...rest }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    <select {...rest} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default Enroll;
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { File, Upload, X } from "lucide-react";

const Enroll = () => {
  const { hash } = useParams();
  const {
    createSeekerProfile,
    getUserDataById,
    getUserIdByToken,
    globalId,
    userData,
  } = useContext(WorkContext);

  const navigate = useNavigate();

  /* Load user ID */
  useEffect(() => {
    getUserIdByToken();
  }, [hash]);

  /* Load user data */
  useEffect(() => {
    if (globalId) getUserDataById(globalId);
  }, [globalId]);

  /* Main Form State */
  const [formData, setFormData] = useState({
    userId: "",
    desiredPost: "",
    status: "Fresher",
    skills: [],
    experience: 0,
    qualifications: "",
    resume: "",
    preferredLocation: "",
    preferredJobType: "Office",
    availableFrom: "",
    currentCompany: "None",
    currentPost: "None",
    currentCTC: 0,
    expectedCTC: 0,
    portfolioLink: "",
    certifications: [],
    languagesKnown: [],
    achievements: [],
  });

  useEffect(() => {
    if (userData?._id) {
      setFormData((prev) => ({ ...prev, userId: userData._id }));
    }
  }, [userData]);

  /* Change Handlers */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["skills", "certifications", "languagesKnown", "achievements"].includes(name)) {
      setFormData({ ...formData, [name]: value.split(",") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, resume: file }));
  };

  /* Submit */
  const handleSubmit = (e) => {
    e.preventDefault();
    createSeekerProfile(formData);
    alert("Profile created successfully!");
    navigate(`/auth/seeker/${hash}`);
  };

  return (
    <div className="min-h-screen py-10 px-6 w-[90%] mx-auto">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl border border-purple-200 p-10">

        <h1 className="text-4xl font-bold text-center mb-8 text-purple-600">
          Create Your Seeker Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* PERSONAL SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Basic Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputGroup
                label="User ID"
                disabled
                name="userId"
                value={formData.userId}
              />
              <InputGroup
                label="Desired Post"
                name="desiredPost"
                value={formData.desiredPost}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                required
              />
              <SelectGroup
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={["Fresher", "Experienced"]}
              />
              <InputGroup
                label="Skills (comma-separated)"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node, SQL"
                required
              />
            </div>
          </section>

          {/* PROFESSIONAL SECTION */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Professional Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputGroup
                label="Experience (years)"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
              />
              <InputGroup
                label="Qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          {/* RESUME UPLOAD */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Resume</h2>

            {/* If resume NOT selected */}
            {!formData.resume && (
              <label className="flex items-center justify-center gap-3 border border-purple-300 bg-purple-50 py-6 rounded-xl cursor-pointer hover:bg-purple-100 transition">
                <Upload className="text-purple-600 w-6 h-6" />
                <span className="font-medium text-purple-700">Upload Resume (PDF)</span>
                <input
                  type="file"
                  name="resume"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            )}

            {/* Show file if selected */}
            {formData.resume && (
              <div className="flex items-center justify-between bg-purple-50 border border-purple-300 p-4 rounded-xl">
                <p className="text-gray-700 flex items-center gap-2">
                  <File className="text-purple-600" /> {formData.resume.name}
                </p>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, resume: "" })}
                  className="text-red-500 p-2 rounded hover:bg-red-100"
                >
                  <X />
                </button>
              </div>
            )}
          </section>

          {/* JOB PREFERENCES */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Job Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputGroup
                label="Preferred Location"
                name="preferredLocation"
                value={formData.preferredLocation}
                onChange={handleChange}
                required
              />
              <SelectGroup
                label="Preferred Job Type"
                name="preferredJobType"
                value={formData.preferredJobType}
                onChange={handleChange}
                options={["Office", "Remote", "Home"]}
              />
              <InputGroup
                type="date"
                label="Available From"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* CURRENT JOB */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Job Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputGroup
                label="Current Company"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleChange}
              />
              <InputGroup
                label="Current Post"
                name="currentPost"
                value={formData.currentPost}
                onChange={handleChange}
              />
              <InputGroup
                label="Current CTC"
                name="currentCTC"
                type="number"
                value={formData.currentCTC}
                onChange={handleChange}
              />
              <InputGroup
                label="Expected CTC"
                name="expectedCTC"
                type="number"
                value={formData.expectedCTC}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* LINKS */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Links</h2>
            <InputGroup
              label="Portfolio Link"
              name="portfolioLink"
              value={formData.portfolioLink}
              onChange={handleChange}
              placeholder="https://yourportfolio.com"
            />
          </section>

          {/* OTHER ARRAYS */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Additional Info</h2>
            <InputGroup
              label="Certifications (comma-separated)"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
            />
            <InputGroup
              label="Languages Known (comma-separated)"
              name="languagesKnown"
              value={formData.languagesKnown}
              onChange={handleChange}
              required
            />
            <InputGroup
              label="Achievements (comma-separated)"
              name="achievements"
              value={formData.achievements}
              onChange={handleChange}
            />
          </section>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            Submit Profile
          </button>
        </form>
      </div>
    </div>
  );
};

/* -------------------- Reusable Components -------------------- */

const InputGroup = ({ label, ...rest }) => (
  <div className="space-y-1">
    <label className="text-gray-600 font-medium">{label}</label>
    <input
      {...rest}
      className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
    />
  </div>
);

const SelectGroup = ({ label, options, ...rest }) => (
  <div className="space-y-1">
    <label className="text-gray-600 font-medium">{label}</label>
    <select
      {...rest}
      className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default Enroll;

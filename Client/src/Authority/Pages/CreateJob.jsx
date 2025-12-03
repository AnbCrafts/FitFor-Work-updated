import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { WorkContext } from "../../ContextAPI/WorkContext";

const CreateJob = () => {
  const { hash } = useParams();
  const { createJob, authData, getCompanyByOwnerId } = useContext(WorkContext);

  const [formData, setFormData] = useState({
    title: "",
    jobRole: "",
    description: "",
    skillsRequired: "",
    experienceRequired: "",
    jobType: "",
    salaryRange: "",
    location: "",
    postedBy: "",
    totalSeats: "",
    deadline: "",
    category: "",
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      getCompanyByOwnerId(userId);
    }
  }, [hash]);

  useEffect(() => {
    if (authData && authData._id) {
      setFormData((prev) => ({ ...prev, postedBy: authData._id }));
    }
  }, [authData]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const isAnyEmpty = Object.values(formData).some(
      (v) => !v || String(v).trim() === ""
    );
    if (isAnyEmpty) return alert("Please fill all fields!");

    try {
      const prepared = {
        ...formData,
        skillsRequired: formData.skillsRequired
          .split(",")
          .map((skill) => skill.trim()),
        totalSeats: Number(formData.totalSeats),
        deadline: new Date(formData.deadline),
      };

      const done = await createJob(prepared);
      alert(done ? "Job Posted Successfully!" : "Failed to Post Job");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen w-[90%] mx-auto py-16 bg-[#F7F8FC]">
      {/* HEADER SECTION */}
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-md border border-gray-200">
        <h1 className="text-3xl font-bold text-purple-600">
          Create a New Job Post
        </h1>
        <p className="text-gray-600 mt-4 leading-relaxed">
          Post job openings and reach thousands of job seekers instantly.
          Provide clear details to help the right candidate apply easily.
        </p>
      </div>

      {/* FORM */}
      <form
  onSubmit={submitHandler}
  className="max-w-7xl mx-auto mt-16 space-y-12 border border-purple-200 rounded-2xl p-5"
>

  {/* SECTION: BASIC INFO */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
      Job Information
    </h2>

    <div className="grid md:grid-cols-2 gap-8">

      {/* Job Title */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Job Title</label>
        <input
          type="text"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
          placeholder="Frontend Developer"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      {/* Job Role */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Job Role</label>
        <input
          type="text"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
          placeholder="SDE, Analyst"
          value={formData.jobRole}
          onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
        />
      </div>

      {/* Experience */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Experience Required</label>
        <input
          type="text"
          placeholder="e.g., 2 years"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200"
          value={formData.experienceRequired}
          onChange={(e) =>
            setFormData({ ...formData, experienceRequired: e.target.value })
          }
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Category</label>
        <input
          type="text"
          placeholder="IT, Finance..."
          className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        />
      </div>

    </div>
  </div>

  <hr className="border-gray-300" />

  {/* SECTION: DETAILS */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
      Job Details
    </h2>

    <div className="grid md:grid-cols-2 gap-8">

      {/* Skills */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Required Skills</label>
        <input
          type="text"
          placeholder="React, SQL, C++"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200"
          value={formData.skillsRequired}
          onChange={(e) =>
            setFormData({ ...formData, skillsRequired: e.target.value })
          }
        />
      </div>

      {/* Job Type */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Job Type</label>
        <select
          className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200"
          value={formData.jobType}
          onChange={(e) =>
            setFormData({ ...formData, jobType: e.target.value })
          }
        >
          <option value="">Select</option>
          <option>Full-Time</option>
          <option>Internship</option>
          <option>Remote</option>
          <option>Contract</option>
        </select>
      </div>

      {/* Salary */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Salary Range</label>
        <input
          type="text"
          placeholder="0–5 LPA"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200"
          value={formData.salaryRange}
          onChange={(e) =>
            setFormData({ ...formData, salaryRange: e.target.value })
          }
        />
      </div>

      {/* Location */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Location</label>
        <input
          type="text"
          placeholder="City, Country"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>

    </div>

    {/* Description */}
    <div className="mt-6">
      <label className="block mb-2 text-gray-700 font-medium">
        Job Description
      </label>
      <textarea
        rows={5}
        placeholder="Describe responsibilities, expectations..."
        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />
    </div>
  </div>

  <hr className="border-gray-300" />

  {/* SECTION: OTHER INFO */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
      Additional Information
    </h2>

    <div className="grid md:grid-cols-2 gap-8">

      {/* Seats */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Available Seats</label>
        <input
          type="number"
          placeholder="e.g., 5"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200"
          value={formData.totalSeats}
          onChange={(e) =>
            setFormData({ ...formData, totalSeats: e.target.value })
          }
        />
      </div>

      {/* Deadline */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Deadline</label>
        <input
          type="date"
          className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-200"
          value={formData.deadline}
          onChange={(e) =>
            setFormData({ ...formData, deadline: e.target.value })
          }
        />
      </div>

    </div>
  </div>

  {/* SUBMIT BUTTON */}
  <div className="pt-6 text-center">
    <button
      type="submit"
      className="px-10 py-3 bg-purple-600 text-white rounded-xl text-lg font-semibold hover:bg-purple-700 shadow-md transition"
    >
      Post Job
    </button>
  </div>
</form>


      {/* WHY CHOOSE US */}
      <div className="mt-16 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-purple-600 mb-10">
          Why Recruit with FitForWork?
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            "Targeted Talent Access",
            "Streamlined Hiring",
            "Company Branding",
            "AI Shortlisting",
            "Recruitment Insights",
            "Reliable Support",
          ].map((title, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl shadow-md border border-gray-200 hover:shadow-purple-200 transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {
                  {
                    "Targeted Talent Access":
                      "Reach skilled individuals using our smart filtering engine.",
                    "Streamlined Hiring":
                      "Manage applications & schedule interviews easily.",
                    "Company Branding":
                      "Showcase your culture & values to attract top talent.",
                    "AI Shortlisting":
                      "Get AI-powered candidate ranking and recommendations.",
                    "Recruitment Insights":
                      "Track hiring performance & trends with analytics.",
                    "Reliable Support":
                      "We're here to help you throughout the hiring process.",
                  }[title]
                }
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateJob;

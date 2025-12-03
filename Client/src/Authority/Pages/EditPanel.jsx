import React, { useContext, useEffect, useState } from "react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { useNavigate, useParams } from "react-router-dom";
import { Upload } from "lucide-react";

const EditPanel = () => {
  const { hash, role } = useParams();
  const {
    editAuthProfile,
    getCompanyByOwnerId,
    getUserDataById,
    authData,
  } = useContext(WorkContext);

  const id = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    owner: "",
    companyEmail: "",
    companyName: "",
    companyLogo: "",
    companyWebsite: "",
    companySize: "",
    industry: "",
    location: "",
    contactNumber: "",
    about: "",
    preferredSkills: [],
    preferredExperience: "",
    jobTypesOffered: "",
  });

  const [img, setImg] = useState("");

  useEffect(() => {
    if (id) {
      getCompanyByOwnerId(id);
      getUserDataById(id);
    }
  }, [hash]);

  useEffect(() => {
    if (authData) {
      setFormData({
        owner: id,
        companyEmail: authData.companyEmail || "",
        companyName: authData.companyName || "",
        companyLogo: authData.companyLogo || "",
        companyWebsite: authData.companyWebsite || "",
        companySize: authData.companySize || "",
        industry: authData.industry || "",
        location: authData.location || "",
        contactNumber: authData.contactNumber || "",
        about: authData.about || "",
        preferredSkills: Array.isArray(authData.preferredSkills)
          ? authData.preferredSkills
          : [],
        preferredExperience: authData.preferredExperience || "",
        jobTypesOffered: authData.jobTypesOffered || "",
      });

      setImg(authData.companyLogo);
    }
  }, [authData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, companyLogo: file });
      setImg(URL.createObjectURL(file));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await editAuthProfile(authData?._id, formData);
      alert("Profile Updated Successfully!");

      navigate(`/auth/${role}/${hash}/profile`);
    } catch (error) {
      alert("Update failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen w-[90%] mx-auto py-10">
  

      {/* MAIN FORM WRAPPER */}
      <div className="w-full mx-auto py-10">

  {/* PAGE HEADER */}
  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text mb-6">
    Update Company Profile
  </h1>

  <p className="text-gray-600 text-lg max-w-3xl mb-12">
    Keep your organization's information up to date. These details help job seekers,
    improve visibility, and strengthen your hiring workflow.
  </p>

  {/* FORM START (NO CARD, NO CONTAINERS) */}
  <form onSubmit={submitHandler} className="space-y-12">

    {/* SECTION — BASIC DETAILS */}
    <div className="space-y-8">

      <div>
        <label className="text-gray-700 font-medium">Company Email</label>
        <input
          type="email"
          className="w-full mt-2 border-b border-gray-300 py-3 outline-none focus:border-purple-500"
          placeholder="Enter company email"
          value={formData.companyEmail}
          onChange={(e) =>
            setFormData({ ...formData, companyEmail: e.target.value })
          }
        />
      </div>

      <div>
        <label className="text-gray-700 font-medium">Company Name</label>
        <input
          type="text"
          className="w-full mt-2 border-b border-gray-300 py-3 outline-none focus:border-purple-500"
          placeholder="Enter company name"
          value={formData.companyName}
          onChange={(e) =>
            setFormData({ ...formData, companyName: e.target.value })
          }
        />
      </div>

      <div>
        <label className="text-gray-700 font-medium">Company Website</label>
        <input
          type="text"
          className="w-full mt-2 border-b border-gray-300 py-3 outline-none focus:border-purple-500"
          placeholder="https://example.com"
          value={formData.companyWebsite}
          onChange={(e) =>
            setFormData({ ...formData, companyWebsite: e.target.value })
          }
        />
      </div>

      <div>
        <label className="text-gray-700 font-medium">Company Size</label>
        <input
          type="text"
          className="w-full mt-2 border-b border-gray-300 py-3 outline-none focus:border-purple-500"
          placeholder="10–100 employees"
          value={formData.companySize}
          onChange={(e) =>
            setFormData({ ...formData, companySize: e.target.value })
          }
        />
      </div>

      <div>
        <label className="text-gray-700 font-medium">Industry</label>
        <input
          type="text"
          className="w-full mt-2 border-b border-gray-300 py-3 outline-none focus:border-purple-500"
          placeholder="IT, Healthcare, Education..."
          value={formData.industry}
          onChange={(e) =>
            setFormData({ ...formData, industry: e.target.value })
          }
        />
      </div>

      <div>
        <label className="text-gray-700 font-medium">Location</label>
        <input
          type="text"
          className="w-full mt-2 border-b border-gray-300 py-3 outline-none focus:border-purple-500"
          placeholder="City, Country"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>

      <div>
        <label className="text-gray-700 font-medium">Contact Number</label>
        <input
          type="text"
          className="w-full mt-2 border-b border-gray-300 py-3 outline-none focus:border-purple-500"
          placeholder="+91 9876543210"
          value={formData.contactNumber}
          onChange={(e) =>
            setFormData({ ...formData, contactNumber: e.target.value })
          }
        />
      </div>

    </div>

    {/* SECTION — ABOUT */}
    <div className="space-y-4">
      <label className="text-gray-700 font-medium">About Company</label>
      <textarea
        rows={4}
        className="w-full border-b border-gray-300 py-3 outline-none focus:border-purple-500"
        placeholder="Write something about the organization..."
        value={formData.about}
        onChange={(e) =>
          setFormData({ ...formData, about: e.target.value })
        }
      />
    </div>

    {/* SECTION — PREFERRED SKILLS */}
    <div className="space-y-3">
      <label className="text-gray-700 font-medium">Preferred Skills</label>

      <div className="flex flex-wrap gap-3">
        {formData.preferredSkills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
          >
            {skill}
            <button
              onClick={() => {
                const updated = [...formData.preferredSkills];
                updated.splice(index, 1);
                setFormData({ ...formData, preferredSkills: updated });
              }}
              className="hover:text-red-600"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        className="w-full border-b border-gray-300 py-3 outline-none focus:border-purple-500"
        placeholder="Type a skill and press Enter"
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === ",") && e.target.value.trim()) {
            e.preventDefault();
            const sk = e.target.value.trim();
            if (!formData.preferredSkills.includes(sk)) {
              setFormData({
                ...formData,
                preferredSkills: [...formData.preferredSkills, sk],
              });
            }
            e.target.value = "";
          }
        }}
      />
    </div>

    {/* SECTION — EXPERIENCE */}
    <div>
      <label className="text-gray-700 font-medium">Preferred Experience</label>
      <input
        type="number"
        className="w-full mt-2 border-b border-gray-300 py-3 outline-none focus:border-purple-500"
        placeholder="Years of experience"
        value={formData.preferredExperience}
        onChange={(e) =>
          setFormData({ ...formData, preferredExperience: e.target.value })
        }
      />
    </div>

    {/* SECTION — JOB TYPES OFFERED */}
    <div>
      <label className="text-gray-700 font-medium">Job Types Offered</label>
      <input
        type="text"
        className="w-full mt-2 border-b border-gray-300 py-3 outline-none focus:border-purple-500"
        placeholder="Remote, On-site, Hybrid"
        value={formData.jobTypesOffered}
        onChange={(e) =>
          setFormData({ ...formData, jobTypesOffered: e.target.value })
        }
      />
    </div>

    {/* SECTION — LOGO UPLOAD */}
    <div className="space-y-3">
      <label className="text-gray-700 font-medium">Company Logo</label>

      <div className="flex items-center gap-4">
        <label
          htmlFor="companyLogo"
          className="cursor-pointer bg-purple-100 px-5 py-2 rounded-lg text-purple-700 hover:bg-purple-200 transition"
        >
          Upload Logo
        </label>

        <input
          type="file"
          id="companyLogo"
          className="hidden"
          onChange={handleImageChange}
        />

        {img && (
          <img
            src={img}
            className="h-20 w-28 rounded-lg object-cover shadow"
          />
        )}
      </div>
    </div>

    {/* BUTTON */}
    <div className="pt-6">
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-3 rounded-xl font-semibold transition"
      >
        Save Changes
      </button>
    </div>

  </form>
</div>

    </div>
  );
};

export default EditPanel;

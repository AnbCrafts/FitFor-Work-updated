import { Upload } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { useNavigate, useParams } from "react-router-dom";

const EmployerForm = () => {
  const { registerForAuthority,getUserIdByToken,globalId } = useContext(WorkContext);
  const {role,hash}= useParams();

  useEffect(()=>{
   const token = localStorage.getItem("userToken");
   if(token){
     getUserIdByToken(token);
   }
   },[hash])
  // alert(auth)
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, companyLogo: file });
      setImg(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    setFormData({ ...formData, owner: globalId });
  }, [globalId]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const isAnyFieldEmpty = Object.values(formData).some(
      (value) => !value || String(value).trim() === ""
    );

    if (isAnyFieldEmpty) {
      alert("Please fill in all the fields.");
      return;
    }

    try {
      await registerForAuthority(formData);
      alert("Registered successfully!");
      setFormData({
    companyEmail: "",
    companyName: "",
    companyLogo: "",
    companyWebsite: "",
    companySize: "",
    industry: "",
    location: "",
    contactNumber: "",
    about: "",
    preferredSkills: "",
    preferredExperience: "",
    jobTypesOffered: "",
  })
    navigate(`/auth/${role}/${hash}/profile`);

    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[100vh] w-[90%] mx-auto my-5">
      <div className="max-w-4xl mx-auto text-center py-12">
  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 text-transparent bg-clip-text">
    Become an Official Authority Partner
  </h1>

  <p className="text-gray-600 text-lg mt-4 leading-relaxed max-w-3xl mx-auto">
    Join our network of trusted employers and start discovering top talent today. 
    Gain access to a dedicated dashboard, smart hiring tools, and seamless job 
    posting capabilities designed to help you grow your team efficiently.
  </p>
</div>


     <form
  onSubmit={submitHandler}
  className="max-w-7xl mx-auto mt-16 space-y-12"
>

  {/* Section: Company Information */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
      Company Information
    </h2>

    <div className="grid md:grid-cols-2 gap-8">

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Company Email</label>
        <input
          type="email"
          className="input"
          placeholder="example@company.com"
          value={formData.companyEmail}
          onChange={(e) =>
            setFormData({ ...formData, companyEmail: e.target.value })
          }
        />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Company Name</label>
        <input
          type="text"
          className="input"
          placeholder="Company Pvt Ltd"
          value={formData.companyName}
          onChange={(e) =>
            setFormData({ ...formData, companyName: e.target.value })
          }
        />
      </div>

      {/* Website */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Website</label>
        <input
          type="text"
          className="input"
          placeholder="https://company.com"
          value={formData.companyWebsite}
          onChange={(e) =>
            setFormData({ ...formData, companyWebsite: e.target.value })
          }
        />
      </div>

      {/* Size */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Company Size</label>
        <input
          type="text"
          className="input"
          placeholder="11–50, 51–200"
          value={formData.companySize}
          onChange={(e) =>
            setFormData({ ...formData, companySize: e.target.value })
          }
        />
      </div>

      {/* Industry */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Industry</label>
        <input
          type="text"
          className="input"
          placeholder="IT, Finance, Education…"
          value={formData.industry}
          onChange={(e) =>
            setFormData({ ...formData, industry: e.target.value })
          }
        />
      </div>

      {/* Location */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">Location</label>
        <input
          type="text"
          className="input"
          placeholder="City, Country"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="text-gray-700 font-medium">Contact Number</label>
        <input
          type="text"
          className="input"
          placeholder="+91 9876543210"
          value={formData.contactNumber}
          onChange={(e) =>
            setFormData({ ...formData, contactNumber: e.target.value })
          }
        />
      </div>

    </div>
  </div>

  <hr className="border-gray-300" />

  {/* Section: About */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
      About the Company
    </h2>

    <textarea
      rows={5}
      className="input w-full"
      placeholder="Describe your company's mission, culture, and values..."
      value={formData.about}
      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
    />
  </div>

  <hr className="border-gray-300" />

  {/* Section: Preferred Skills & Experience */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
      Candidate Preferences
    </h2>

    <div className="grid md:grid-cols-2 gap-8">

      {/* Preferred Skills */}
      <div className="flex flex-col gap-3">
        <label className="text-gray-700 font-medium mb-2">
          Preferred Skills
        </label>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {formData.preferredSkills?.map((skill, index) => (
            <span
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                className="text-purple-500 hover:text-red-500"
                onClick={() => {
                  const updated = [...formData.preferredSkills];
                  updated.splice(index, 1);
                  setFormData({ ...formData, preferredSkills: updated });
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* Input */}
        <input
          type="text"
          className="input"
          placeholder="Type a skill and press Enter"
          onKeyDown={(e) => {
            if (
              (e.key === "Enter" || e.key === ",") &&
              e.target.value.trim() !== ""
            ) {
              e.preventDefault();
              const skill = e.target.value.trim();
              if (!formData.preferredSkills?.includes(skill)) {
                setFormData({
                  ...formData,
                  preferredSkills: [...(formData.preferredSkills || []), skill],
                });
              }
              e.target.value = "";
            }
          }}
        />
      </div>

      {/* Preferred Experience */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-700 font-medium">
          Preferred Experience (Years)
        </label>
        <input
          type="number"
          className="input"
          placeholder="e.g., 2"
          value={formData.preferredExperience}
          onChange={(e) =>
            setFormData({
              ...formData,
              preferredExperience: e.target.value,
            })
          }
        />
      </div>

      {/* Job Types */}
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="text-gray-700 font-medium">Job Types Offered</label>
        <input
          type="text"
          className="input"
          placeholder="Remote, Office, Hybrid"
          value={formData.jobTypesOffered}
          onChange={(e) =>
            setFormData({ ...formData, jobTypesOffered: e.target.value })
          }
        />
      </div>

    </div>
  </div>

  <hr className="border-gray-300" />

  {/* Section: Logo Upload */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
      Upload Company Logo
    </h2>

    <label
      htmlFor="companyLogo"
      className="flex flex-col items-center justify-center w-full md:w-[350px] h-[180px] bg-white border-2 border-dashed border-purple-300 rounded-xl text-gray-500 cursor-pointer hover:bg-purple-50 transition"
    >
      {img ? (
        <img
          src={img}
          alt="Logo"
          className="h-full w-full object-cover rounded-xl"
        />
      ) : (
        <>
          <Upload className="w-8 h-8 text-purple-500 mb-3" />
          <span className="font-medium">Click to upload logo</span>
        </>
      )}
    </label>

    <input
      type="file"
      id="companyLogo"
      className="hidden"
      onChange={(e) => handleImageChange(e)}
    />
  </div>

  {/* Submit Button */}
  <div className="text-center">
    <button
      type="submit"
      className="px-10 py-3 bg-purple-600 text-white rounded-xl text-lg font-semibold hover:bg-purple-700 shadow-md transition"
    >
      Register Company
    </button>
  </div>
</form>


      
    </div>
  );
};

export default EmployerForm;

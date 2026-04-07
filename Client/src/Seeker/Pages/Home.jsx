import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { companyDB } from '../assets/companyDB';
import MessageBox from '../Components/MessageBox';
import { vaccancy } from '../assets/VaccancyDB';
import Vaccancy from '../Components/Vaccancy';
import { WorkContext } from '../../ContextAPI/WorkContext';
import { categoryIcons } from '../assets/iconMap';
import Dashboard from '../Components/Dashboard';

const Home = () => {
  // FIXED: Destructured corrected names from WorkContext
  const { 
    getAllRequirementsForJob, 
    requirements, 
    getMySeekerProfile, // Replaced getSeekerDataByUserId
    userSeekerData,     // Replaced user_seekerData
    isLoggedIn 
  } = useContext(WorkContext);

  const { role, username } = useParams(); // Replaced hash with username
  const navigate = useNavigate(); 

  // --- [EFFECT: SYNC PROFILE] ---
  useEffect(() => {
    // If logged in but seeker data isn't loaded yet, fetch it via Cookie
    if (isLoggedIn && !userSeekerData) {
      getMySeekerProfile();
    }
  }, [isLoggedIn, userSeekerData, getMySeekerProfile]);

  // --- [EFFECT: LOAD REQUIREMENTS] ---
  useEffect(() => {
    getAllRequirementsForJob();
  }, [getAllRequirementsForJob]);


  const [suggestionForm, setSuggestionForm] = useState({
    roles: "",
    location: "",
    jobType: "",
    category: "",
    experience: "",
    skills: "",
  });

  const submitHandler = (e) => {
    e.preventDefault();
    const { roles, location, jobType, category, experience, skills } = suggestionForm;
    const params = new URLSearchParams();

    if (roles) params.append("roles", roles.trim());
    if (location) params.append("location", location.trim());
    if (jobType) params.append("jobType", jobType.trim());
    if (category) params.append("category", category.trim());
    if (experience) params.append("experience", experience.trim());
    if (skills) params.append("skills", skills.trim());

    if (!params.toString()) {
      navigate("jobs");
    } else {
      navigate(`jobs/custom/${params.toString()}`);
    }
  };

  const SuggestionSelect = ({ label, name, list }) => (
    <div>
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <select
        className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white outline-none focus:border-purple-500 transition"
        onChange={(e) =>
          setSuggestionForm((prev) => ({ ...prev, [name]: e.target.value }))
        }
      >
        <option value="" className="text-gray-500">Select {label}</option>
        {list?.map((item, index) => (
          <option key={index} value={item} className="text-gray-900">
            {item}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gray-50">
      
      {/* 🚀 If seeker profile is loaded → render Dashboard, else Hero */}
      {userSeekerData ? (
        <Dashboard />
      ) : (
        <>
          {/* HERO SECTION */}
          <section className="w-[90%] mx-auto mt-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
                Find Your <span className="text-purple-600">Perfect Job</span> Today
              </h1>
              <p className="text-gray-600 text-lg mt-3">
                Smart recommendations, powerful search, and a clean dashboard to help you land your dream role.
              </p>
              <Link
                to={`/auth/${role}/${username}/enroll`}
                className="inline-block mt-6 bg-purple-600 text-white px-7 py-3 rounded-xl font-semibold shadow hover:bg-purple-700 transition"
              >
                Build Your Profile →
              </Link>
            </div>
            <div className="flex-1">
              <img
                src={assets.floating3}
                alt="Job Search Illustration"
                className="w-full rounded-3xl shadow-xl object-cover"
              />
            </div>
          </section>

          {/* QUICK SEARCH BAR */}
          <section className="max-w-2xl mx-auto mt-12">
            <div className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 border border-gray-200">
              <input
                type="search"
                placeholder="Search jobs, roles, companies..."
                className="flex-1 px-5 py-3 rounded-lg border border-gray-300 outline-none focus:border-purple-500"
              />
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition">
                Search
              </button>
            </div>
          </section>

          {/* TRENDING JOBS */}
          <section className="w-[90%] mx-auto mt-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              Trending <span className="text-purple-600">Jobs</span>
            </h2>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {vaccancy.slice(0, 6).map((item, idx) => (
                <Vaccancy key={idx} vacancies={item} />
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="jobs" className="text-lg font-semibold text-purple-600 hover:underline">
                View All Jobs →
              </Link>
            </div>
          </section>

          {/* CATEGORIES SECTION */}
          <section className="w-[90%] mx-auto mt-20">
            <h2 className="text-3xl font-bold text-center">
              Explore <span className="text-purple-600">Categories</span>
            </h2>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {requirements?.category?.slice(0, 10).map((cat, idx) => {
                const Icon = categoryIcons[idx % categoryIcons.length];
                return (
                  <Link
                    key={idx}
                    to={`jobs/custom/category=${cat}`}
                    className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg hover:border-purple-300 transition flex flex-col items-center text-center"
                  >
                    <Icon size={34} className="text-purple-600 mb-3" />
                    <p className="font-semibold text-gray-800">{cat}</p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* SUGGESTION FORM */}
          <section className="w-[90%] mx-auto mt-24">
            <h2 className="text-3xl font-bold text-center mb-6">
              Get Personalized <span className="text-purple-600">Job Matches</span>
            </h2>
            <form
              onSubmit={submitHandler}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 space-y-7 max-w-3xl mx-auto"
            >
              <SuggestionSelect label="Role" name="roles" list={requirements?.roles} />
              <SuggestionSelect label="Category" name="category" list={requirements?.category} />
              <SuggestionSelect label="Location" name="location" list={requirements?.location} />
              <SuggestionSelect label="Skills" name="skills" list={requirements?.skills} />
              <SuggestionSelect label="Job Type" name="jobType" list={requirements?.jobType} />
              <SuggestionSelect label="Experience" name="experience" list={requirements?.experience} />
              <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition">
                Get Suggestions
              </button>
            </form>
          </section>

          <MessageBox />
        </>
      )}
    </div>
  );
}

export default Home;
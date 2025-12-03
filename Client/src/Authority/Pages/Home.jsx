import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowBigRightDash } from "lucide-react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import PageNav from "../../Global/Components/PageNav";
import Dashboard from "../Components/Dashboard";
import MessageBox from "../Components/MessageBox";
import Bottom from "../Components/Bottom";
import { skillsDB } from "../assets/SkillsDB";
import { assets } from "../assets/assets";

const EmployerHome = () => {
  const { hash } = useParams();
  const navigate = useNavigate();

  const {
    getSkills,
    allSkills,
    getCompanyByOwnerId,
    authData,
  } = useContext(WorkContext);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) getCompanyByOwnerId(id);
  }, [hash]);

  useEffect(() => {
    getSkills();
  }, []);

  // ------------------------------
  // Search Talent States
  // ------------------------------
  const [currCategory, setCurrCategory] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [search, setSearch] = useState(false);

  // Pagination for skill categories
  const [skillPage, setSkillPage] = useState(1);
  const perPage = 9;

  const skillEntries = allSkills ? Object.entries(allSkills) : [];
  const totalPages = Math.ceil(skillEntries.length / perPage);
  const sliced = skillEntries.slice((skillPage - 1) * perPage, skillPage * perPage);

  // Trigger search URL
  useEffect(() => {
    if (
      search &&
      currCategory &&
      Array.isArray(allSkills[currCategory]) &&
      allSkills[currCategory].includes(selectedValue)
    ) {
      navigate(`custom-suggestions/${currCategory}=${selectedValue}`);
    }
  }, [search, currCategory, selectedValue, allSkills]);

  // Helper to beautify category name
  const beautify = (str = "") =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

  // ---------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ---------------------- EMPLOYER DASHBOARD ---------------------- */}
      {authData && <Dashboard />}

      {/* ---------------------- HERO WHEN NO PROFILE ---------------------- */}
      {!authData && (
        <div className="w-[90%] mx-auto bg-white shadow-md rounded-2xl p-10 mt-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900">Hire The Right Talent</h1>
          <p className="mt-3 text-gray-600 text-lg max-w-xl">
            Post jobs, find candidates, and manage hiring — all in one place.
          </p>

          <div className="mt-8 bg-indigo-50 border border-indigo-200 p-6 rounded-xl max-w-lg">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
              New Employer? Build Your Profile
            </h2>
            <Link
              to="build/employer-form"
              className="block w-fit mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              + Create Employer Profile
            </Link>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* TALENT SEARCH SECTION */}
      {/* -------------------------------------------------- */}
      <div className="w-[90%] mx-auto bg-white rounded-2xl shadow-md p-10 mt-12 border border-gray-200">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Search Skilled Candidates</h2>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Choose a category, select a skill/value, and explore matching candidates.
          </p>
        </div>

        {/* Dropdown + Search */}
        <div className="flex gap-4 items-center flex-col md:flex-row">

          {/* Category Selection */}
          <select
            className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 w-full md:w-1/4"
            onChange={(e) => {
              setCurrCategory(e.target.value);
              setSelectedValue("");
            }}
          >
            <option value="">Select Category</option>
            {skillEntries.map(([key]) => (
              <option key={key} value={key}>
                {beautify(key)}
              </option>
            ))}
          </select>

          {/* Value Selection */}
          <select
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            disabled={!currCategory}
            className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 w-full md:w-1/2 disabled:bg-gray-200 disabled:text-gray-400"
          >
            <option value="">Select {beautify(currCategory)}</option>
            {currCategory &&
              allSkills[currCategory]?.map((it, i) => (
                <option key={i} value={it}>
                  {it}
                </option>
              ))}
          </select>

          {/* Search */}
          <button
            onClick={() => setSearch(true)}
            className="bg-indigo-600 px-6 py-3 text-white rounded-lg hover:bg-indigo-700"
          >
            Search
          </button>
        </div>

        {/* Category Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sliced.map(([key]) => (
            <div
              key={key}
              onClick={() => setCurrCategory(key)}
              className="cursor-pointer p-5 bg-gray-100 border border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 flex items-center justify-between"
            >
              <span className="text-lg font-semibold text-gray-800">{beautify(key)}</span>
              <ArrowBigRightDash className="text-indigo-600" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8">
          <PageNav
            currentPage={skillPage}
            totalPages={totalPages}
            incrementer={setSkillPage}
          />
        </div>
      </div>

      {/* ---------------------- CREATE VACANCY SECTION ---------------------- */}
      <div className="w-[90%] mx-auto bg-white p-10 rounded-2xl shadow-md mt-12 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900">Create a Job Vacancy</h2>
        <p className="text-gray-600 mt-2 max-w-xl">
          Post job roles, set filters, and attract the best candidates instantly.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[
            {
              icon: "🛠️",
              title: "Define Role",
              desc: "Add job title, description & requirements.",
            },
            {
              icon: "🎯",
              title: "Set Filters",
              desc: "Select skills, experience, location & more.",
            },
            {
              icon: "📅",
              title: "Schedule & Publish",
              desc: "Set deadlines or publish instantly.",
            },
          ].map((b, i) => (
            <div
              key={i}
              className="bg-gray-100 p-6 rounded-xl border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition"
            >
              <div className="text-4xl mb-3">{b.icon}</div>
              <h3 className="text-xl font-semibold mb-1">{b.title}</h3>
              <p className="text-gray-600 text-sm">{b.desc}</p>
            </div>
          ))}
        </div>

        <Link
          to="create/job-vacancy"
          className="inline-block mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          + Post a Job
        </Link>
      </div>

      {/* ---------------------- TRENDING SKILLS ---------------------- */}
      <div className="w-[90%] mx-auto mt-12 bg-white p-10 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900">Trending Skills</h2>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillsDB.map((item, i) => (
            <div
              key={i}
              className="bg-gray-100 p-5 rounded-xl text-center border border-gray-300 hover:bg-indigo-50 hover:border-indigo-500 transition"
            >
              <div className="text-4xl">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mt-3">
                {item.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------- HIRING STEPS ---------------------- */}
      <div className="w-[90%] mx-auto mt-12 bg-white p-10 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          How Hiring Works
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {[
            {
              icon: "📝",
              title: "Create Employer Account",
              desc: "Register your organization and start hiring.",
            },
            {
              icon: "📢",
              title: "Post a Job",
              desc: "Add openings with role details & filters.",
            },
            {
              icon: "🧠",
              title: "Review Applicants",
              desc: "See matched candidates instantly.",
            },
            {
              icon: "🤝",
              title: "Hire the Best",
              desc: "Interview & finalize — all in one place.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-gray-100 p-6 rounded-xl border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition"
            >
              <div className="text-5xl">{step.icon}</div>
              <h3 className="text-xl font-semibold mt-2">{step.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------- TESTIMONIALS ---------------------- */}
      <div className="w-[90%] mx-auto mt-12 bg-white p-10 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          What Employers Say
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {[
            {
              name: "Sonal Kapoor",
              quote:
                "We filled 3 technical roles quickly. Candidate filtering saved hours.",
              role: "Recruitment Lead",
            },
            {
              name: "Rajeev Arora",
              quote:
                "The dashboard is simple and extremely effective for HR workflow.",
              role: "HR Head",
            },
            {
              name: "Meenal Desai",
              quote:
                "The platform consistently gives high-quality, verified candidates.",
              role: "Talent Acquisition Manager",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-gray-100 p-6 border border-gray-300 rounded-xl shadow-sm hover:border-indigo-500 transition"
            >
              <p className="italic text-gray-700">“{t.quote}”</p>
              <h4 className="text-lg font-semibold mt-3">{t.name}</h4>
              <p className="text-gray-500 text-sm">{t.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------- MESSAGE BOX + FOOTER ---------------------- */}
      <MessageBox />

      <div className="w-[90%] mx-auto mt-10">
        <Bottom />
      </div>
    </div>
  );
};

export default EmployerHome;

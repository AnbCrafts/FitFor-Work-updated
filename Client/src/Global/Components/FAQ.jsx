import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const [activeTab, setActiveTab] = useState("seeker");
  const [openFAQ, setOpenFAQ] = useState(null);

  const seekerFAQ = [
    {
      q: "Is FitForWork free for job seekers?",
      a: "Yes! Searching for jobs, applying, saving jobs, and managing your profile is completely free for all job seekers.",
    },
    {
      q: "How do I get better job recommendations?",
      a: "Fill out your profile completely and upload your resume. Our AI matches your skills with real-time job listings.",
    },
    {
      q: "Can I apply for jobs without a resume?",
      a: "Yes, but we strongly recommend uploading one to improve your chances of getting shortlisted.",
    },
  ];

  const employerFAQ = [
    {
      q: "Do employers need to pay to post jobs?",
      a: "Yes, job posting is paid. We offer affordable plans for startups, agencies, and enterprises.",
    },
    {
      q: "How does applicant tracking work?",
      a: "Employers get a complete dashboard with filters, communication tools, analytics, and shortlist options.",
    },
    {
      q: "Can I contact candidates directly?",
      a: "Yes. Employers can message applicants through the built-in Message Center without needing email exchange.",
    },
  ];

  const currentFAQ = activeTab === "seeker" ? seekerFAQ : employerFAQ;

  return (
    <section className="w-[90%] mx-auto mt-28 mb-20">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Frequently Asked <span className="text-purple-600">Questions</span>
        </h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
          Everything you need to know about FitForWork as a job seeker or an employer.
        </p>
      </div>

      {/* TABS */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <button
          onClick={() => setActiveTab("seeker")}
          className={`px-5 py-2 rounded-xl text-sm font-semibold border transition
            ${
              activeTab === "seeker"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-purple-100"
            }
          `}
        >
          For Job Seekers
        </button>

        <button
          onClick={() => setActiveTab("employer")}
          className={`px-5 py-2 rounded-xl text-sm font-semibold border transition
            ${
              activeTab === "employer"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-purple-100"
            }
          `}
        >
          For Employers
        </button>
      </div>

      {/* FAQ ACCORDION */}
      <div className="max-w-3xl mx-auto space-y-4">
        {currentFAQ.map((item, i) => (
          <div
            key={i}
            className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm"
          >
            {/* QUESTION */}
            <button
              className="w-full flex justify-between items-center"
              onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
            >
              <span className="text-sm font-semibold text-gray-800">{item.q}</span>
              <ChevronDown
                size={20}
                className={`text-purple-600 transition-transform ${
                  openFAQ === i ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ANSWER */}
            {openFAQ === i && (
              <p className="text-sm text-gray-600 mt-3 leading-snug">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

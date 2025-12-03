import React from 'react';
import { FaUserCheck, FaClipboardCheck, FaRocket, FaFilter, FaClock } from 'react-icons/fa';

const Bottom = () => {
  const benefits = [
    {
      icon: <FaUserCheck className="text-3xl text-purple-500" />,
      title: "Verified Candidates",
      desc: "Access a pool of verified, skill-assessed, and job-ready candidates.",
    },
    {
      icon: <FaClipboardCheck className="text-3xl text-indigo-500" />,
      title: "Simplified Hiring Process",
      desc: "Post jobs, screen applicants, and schedule interviews all in one place.",
    },
    {
      icon: <FaRocket className="text-3xl text-pink-500" />,
      title: "Boost Your Reach",
      desc: "Get your listings in front of thousands of active job seekers instantly.",
    },
    {
      icon: <FaFilter className="text-3xl text-blue-500" />,
      title: "Smart Filters",
      desc: "Filter applicants by skills, experience, education, and location.",
    },
    {
      icon: <FaClock className="text-3xl text-yellow-500" />,
      title: "Faster Recruitment",
      desc: "Hire qualified talent quickly with our optimized platform tools.",
    },
  ];

  return (
    <div className="py-14 px-6 w-[90%] mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
        Why Hire Through Our Platform?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((item, idx) => (
          <div
            key={idx}
            className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bottom;

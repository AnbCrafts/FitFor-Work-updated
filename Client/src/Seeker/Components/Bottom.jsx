import React from "react";
import {
  FaSearch,
  FaUserTie,
  FaCheckCircle,
  FaMoneyBillWave,
  FaFilter,
} from "react-icons/fa";

const Bottom = () => {
  const benefits = [
    {
      icon: <FaSearch className="text-3xl text-purple-600" />,
      title: "Advanced Job Search",
      desc: "Find opportunities with filters for skills, salary, location and more.",
    },
    {
      icon: <FaUserTie className="text-3xl text-blue-600" />,
      title: "Verified Listings",
      desc: "We ensure all job listings are legitimate and regularly updated.",
    },
    {
      icon: <FaCheckCircle className="text-3xl text-green-600" />,
      title: "Easy Application Process",
      desc: "Apply instantly using your smart FitForWork profile.",
    },
    {
      icon: <FaMoneyBillWave className="text-3xl text-yellow-500" />,
      title: "Salary Transparency",
      desc: "Know expected compensation up-front for each job.",
    },
    {
      icon: <FaFilter className="text-3xl text-pink-600" />,
      title: "Smart Filters",
      desc: "Narrow results using industry, experience, job type and more.",
    },
  ];

  return (
    <div className="py-14 px-4 mt-16">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
        Why Choose FitForWork?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">

        {benefits.map((item, idx) => (
          <div
            key={idx}
            className="
              bg-white 
              rounded-xl 
              p-6 
              border 
              border-gray-200 
              shadow-sm 
              hover:shadow-lg 
              hover:-translate-y-1 
              transition-all 
              duration-300 
              cursor-pointer 
              flex flex-col 
              items-start 
              gap-3
            "
          >
            <div>{item.icon}</div>

            <h3 className="text-lg font-semibold text-gray-900">
              {item.title}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Bottom;

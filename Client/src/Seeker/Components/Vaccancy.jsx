import React from "react";

const Vacancy = ({ vacancies }) => {
  return (
    <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-md p-6 hover:shadow-lg transition-all duration-300">
      
      {/* Top */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="text-purple-600 text-4xl">
          {vacancies.icon}
        </div>

        <h2 className="text-xl font-semibold text-gray-800">
          {vacancies.role}
        </h2>

        <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
          {vacancies.category}
        </span>
      </div>

      {/* Details Section */}
      <div className="mt-5 p-4 rounded-xl border border-purple-200 bg-purple-50">
        <p className="text-gray-700 text-sm mb-2">
          <span className="font-semibold">🏢 Company:</span> {vacancies.company}
        </p>

        <p className="text-gray-700 text-sm mb-4">
          <span className="font-semibold">📄 Vacancies:</span> {vacancies.vacancies}
        </p>

        <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
          View Details
        </button>
      </div>

    </div>
  );
};

export default Vacancy;

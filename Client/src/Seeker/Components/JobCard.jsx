// JobCard.jsx
import React, { useContext } from "react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
  const { convertToStandardDateTime } = useContext(WorkContext);
  const navigate = useNavigate();

  const initials = job?.title ? job.title.trim().charAt(0).toUpperCase() : "?";

  return (
    <article className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 truncate">{job?.title}</h4>

          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
            <span className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100">{job?.jobRole}</span>
            <span className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100">{job?.experienceRequired}</span>
            <span className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100">
              {convertToStandardDateTime?.(job?.deadline) ?? "No deadline"}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-violet-400 flex items-center justify-center text-white font-bold text-xl">
            {initials}
          </div>
          <span className="text-xs text-gray-500 mt-2">{job?.jobType}</span>
        </div>
      </div>

      <div className="text-sm text-gray-700 flex items-center gap-3 flex-wrap">
        <span className="px-2 py-1 rounded bg-gray-50 border border-gray-100">💼 {job?.jobType}</span>
        <span className="px-2 py-1 rounded bg-gray-50 border border-gray-100">💰 {job?.salaryRange ?? "—"}</span>
        <span className="px-2 py-1 rounded bg-gray-50 border border-gray-100">📍 {job?.location ?? "Remote"}</span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-3">{job?.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <time>{convertToStandardDateTime?.(job?.createdAt) ?? ""}</time>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`detail/${job?._id}`)}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition"
          >
            View
          </button>

          <button
            onClick={() => navigate(`apply/${job?._id}`)}
            className="px-3 py-1.5 border border-purple-600 text-purple-600 rounded-md text-sm hover:bg-purple-50 transition"
          >
            Apply
          </button>
        </div>
      </div>
    </article>
  );
};

export default JobCard;

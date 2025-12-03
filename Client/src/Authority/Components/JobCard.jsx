import React from "react";
import { Link } from "react-router-dom";
import { getRandomJobIcon } from "../UI/RandomJobIcons";

const JobCard = ({
  createdAt,
  deadline,
  title,
  jobRole,
  totalSeats,
  status,
  experienceRequired,
  description,
  jobType,
  id,
}) => {
  const { icon: IconComponent } = getRandomJobIcon();

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 w-full max-w-sm hover:shadow-lg hover:shadow-purple-200 transition-all">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>

        <div className="p-3 bg-purple-100 rounded-xl">
          <IconComponent className="h-6 w-6 text-purple-600" />
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-800">Role:</span> {jobRole}
        </p>
        <p>
          <span className="font-medium text-gray-800">Experience:</span>{" "}
          {experienceRequired}
        </p>
        <p>
          <span className="font-medium text-gray-800">Type:</span> {jobType}
        </p>
        <p>
          <span className="font-medium text-gray-800">Status:</span> {status}
        </p>
        <p>
          <span className="font-medium text-gray-800">Seats:</span> {totalSeats}
        </p>
        <p>
          <span className="font-medium text-gray-800">Posted:</span>{" "}
          {new Date(createdAt).toDateString()}
        </p>
        <p>
          <span className="font-medium text-gray-800">Deadline:</span>{" "}
          {new Date(deadline).toDateString()}
        </p>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm mt-3 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* Button */}
      <div className="mt-5 text-right">
        <Link
          to={`job/${id}`}
          className="text-sm px-4 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all"
        >
          View in Detail
        </Link>
      </div>
    </div>
  );
};

export default JobCard;

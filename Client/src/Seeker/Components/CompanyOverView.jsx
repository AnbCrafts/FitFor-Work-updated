import React from "react";
import {
  Dot,
  MapPin,
  Mail,
  Phone,
  Globe,
  Users,
  BriefcaseBusiness,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const OverView = ({ company }) => {
  const navigate = useNavigate();

  const {
    companyName,
    companyLogo,
    location,
    preferredSkills = [],
    about,
    companyEmail,
    contactNumber,
    companyWebsite,
    companySize,
    industry,
    _id,
  } = company;

  const handleViewDetails = () => navigate(`detail/${_id}`);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <img
          src={companyLogo}
          alt="Company Logo"
          className="w-16 h-16 rounded-full object-cover border border-gray-300"
        />

        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{companyName}</h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-purple-600" />
            {location}
          </p>
        </div>
      </div>

      {/* About */}
      <p className="text-gray-600 text-sm mt-4 line-clamp-2">{about}</p>

      {/* Skills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {preferredSkills.slice(0, 8).map((skill, index) => (
          <span
            key={index}
            className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs border border-purple-200"
          >
            <Dot className="w-4 h-4 text-purple-500" />
            {skill.trim()}
          </span>
        ))}

        {preferredSkills.length > 8 && (
          <span className="text-sm text-gray-500">+ more</span>
        )}
      </div>

      {/* Info Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600">
        {companyEmail && (
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-600" />
            {companyEmail}
          </p>
        )}

        {contactNumber && (
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-purple-600" />
            {contactNumber}
          </p>
        )}

        {companyWebsite && (
          <p className="flex items-center gap-2 break-all">
            <Globe className="w-4 h-4 text-purple-600" />
            {companyWebsite}
          </p>
        )}

        {companySize && (
          <p className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            {companySize}
          </p>
        )}

        {industry && (
          <p className="flex items-center gap-2">
            <BriefcaseBusiness className="w-4 h-4 text-purple-600" />
            {industry}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="mt-6 text-right">
        <button
          onClick={handleViewDetails}
          className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default OverView;

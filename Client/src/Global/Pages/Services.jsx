import React from "react";
import {
  Briefcase,
  Search,
  ShieldCheck,
  UserCheck,
  SlidersHorizontal,
  FileText,
} from "lucide-react";

const services = [
  {
    title: "Smart Job Matching",
    icon: <Search className="text-purple-600 w-10 h-10" />,
    description:
      "Our AI analyzes your profile and suggests jobs tailored to your experience and skills.",
  },
  {
    title: "Resume Analysis",
    icon: <FileText className="text-purple-600 w-10 h-10" />,
    description:
      "Upload your resume and get instant insights & suggestions for improvement.",
  },
  {
    title: "Verified Companies",
    icon: <ShieldCheck className="text-purple-600 w-10 h-10" />,
    description:
      "All companies are verified to ensure a safe and secure hiring environment.",
  },
  {
    title: "One-Click Apply",
    icon: <UserCheck className="text-purple-600 w-10 h-10" />,
    description:
      "Apply to multiple jobs with a single click. No repetitive form filling.",
  },
  {
    title: "Role-Based Dashboards",
    icon: <SlidersHorizontal className="text-purple-600 w-10 h-10" />,
    description:
      "Separate, user-friendly dashboards for job seekers, recruiters, and admins.",
  },
  {
    title: "Live Application Tracking",
    icon: <Briefcase className="text-purple-600 w-10 h-10" />,
    description:
      "Track your job application status in real time and get notified about updates.",
  },
];

const Services = () => {
  return (
    <div className="min-h-screen px-6 py-16 bg-[#F7F8FC] w-[90%] mx-auto">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-center mb-14 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
        Our <span className="text-gray-900">Services</span>
      </h1>

      {/* Services Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-3xl shadow-md border border-gray-200 text-center hover:shadow-lg hover:shadow-purple-200 transition-all"
          >
            <div className="mb-4 flex justify-center">{service.icon}</div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {service.title}
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;

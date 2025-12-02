import { MapPin, Briefcase, DollarSign, Clock } from "lucide-react";
import { assets } from "../../assets/assets";

export default function FeaturedJobs() {

  const jobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Google",
      logo: assets.google,
      location: "California, USA",
      salary: "$80k - $120k",
      type: "Full-Time",
      badge: "Featured",
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Figma",
      logo: assets.figma,
      location: "San Francisco, USA",
      salary: "$70k - $110k",
      type: "Remote",
      badge: "Hot",
    },
    {
      id: 3,
      title: "Backend Engineer",
      company: "Netflix",
      logo: assets.netflix,
      location: "Los Gatos, USA",
      salary: "$100k - $160k",
      type: "Hybrid",
      badge: "Urgent",
    },
  ];

  return (
    <section className="w-[90%] mx-auto mt-24 bg-gray-50 py-10 px-5 rounded-lg shadow-lg">

      {/* BADGE */}
      <div className="mx-auto w-fit px-4 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
        Featured Roles
      </div>

      {/* TITLE */}
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mt-3 leading-snug">
        Explore Top <span className="text-purple-600">Featured Jobs</span>
      </h2>

      {/* SUBTITLE */}
      <p className="text-center text-gray-500 mt-2 text-sm max-w-xl mx-auto">
        Apply to the most in-demand and high-paying roles available right now.
      </p>

      {/* BACKGROUND GLOW */}
      <div className="relative mt-14">
        <div className="absolute inset-0 -z-10 mx-auto w-[60%] h-[240px] bg-purple-100 blur-[100px] opacity-40 rounded-full"></div>
      </div>

      {/* GRID (Staggered) */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-7 relative">

        {jobs.map((job, i) => (
          <div
            key={job.id}
            className={`
              bg-white p-6 rounded-2xl border border-purple-200
              shadow-md hover:shadow-xl hover:border-purple-500
              transition duration-300 cursor-pointer
              ${i === 1 ? "translate-y-6" : ""}
            `}
          >

            {/* Badge */}
            <span className="
              text-xs font-semibold px-3 py-[2px] rounded-full mb-3 inline-block
              bg-purple-100 text-purple-700 border border-purple-200
            ">
              {job.badge}
            </span>

            {/* Company Row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center">
                <img src={job.logo} alt={job.company} className="h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-md">{job.title}</h3>
                <p className="text-sm text-gray-500">{job.company}</p>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2 text-sm text-gray-700">

              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-purple-600" />
                {job.location}
              </div>

              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-purple-600" />
                {job.salary}
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} className="text-purple-600" />
                {job.type}
              </div>
            </div>

            {/* CTA */}
            <button className="
              mt-5 w-full bg-purple-600 text-white py-2 rounded-xl 
              hover:bg-purple-700 transition font-medium
            ">
              Apply Now
            </button>

          </div>
        ))}

      </div>

      {/* Bottom separator */}
      <div className="mt-14 w-full flex justify-center">
        <div className="h-[3px] w-40 bg-purple-200 rounded-full"></div>
      </div>

    </section>
  );
}

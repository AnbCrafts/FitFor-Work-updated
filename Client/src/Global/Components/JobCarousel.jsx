import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";

export default function JobCarousel() {
  const jobList = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Google",
      location: "Mountain View, CA",
      salary: "$80k – $120k / year",
      image: assets.floating1,
      badge: "Active"
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Figma",
      location: "San Francisco, CA",
      salary: "$70k – $110k / year",
      image: assets.floating2,
      badge: "New"
    },
    {
      id: 3,
      title: "Backend Engineer",
      company: "Netflix",
      location: "Los Gatos, CA",
      salary: "$100k – $160k / year",
      image: assets.floating3,
      badge: "Hiring"
    },
    {
      id: 4,
      title: "Data Analyst",
      company: "Spotify",
      location: "New York, NY",
      salary: "$75k – $130k / year",
      image: assets.floating2,
      badge: "Urgent"
    },
    {
      id: 5,
      title: "Mobile App Developer",
      company: "Instagram",
      location: "Menlo Park, CA",
      salary: "$90k – $150k / year",
      image: assets.floating1,
      badge: "Featured"
    }
  ];

  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  /** Auto-slide logic with fade */
  useEffect(() => {
    const timer = setInterval(() => {
      // start fade out
      setFade(false);

      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % jobList.length);
        setFade(true); // fade back in
      }, 400);

    }, 5000); // 5 seconds

    return () => clearInterval(timer);
  }, []);

  const job = jobList[current];

  return (
    <div className="w-full h-auto flex flex-col items-center">

      {/* CARD */}
      <div
        className={`relative mt-3 w-full h-48 rounded-2xl overflow-hidden shadow-lg transition-all duration-700 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Background Image */}
        <img
          src={job.image}
          alt={job.title}
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className="absolute bottom-4 left-4 text-purple-100">
          <h2 className="text-lg font-semibold">{job.title}</h2>
          <p className="text-sm opacity-90">
            {job.company} • {job.location}
          </p>
          <p className="text-sm opacity-80 mt-1">{job.salary}</p>
        </div>

        {/* Badge */}
        <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
          {job.badge}
        </div>
      </div>

      {/* NEW BEAUTIFUL INDICATOR */}
      {/* <div className="mt-4">
        <div className="px-4 py-1 bg-gray-100 rounded-full shadow-sm text-gray-700 text-sm font-semibold flex items-center gap-2">
          <span className="text-purple-600 text-base">{current + 1}</span>
          out of
          <span className="text-gray-500 text-sm"> {jobList.length}</span>
        </div>
      </div> */}
    </div>
  );
}

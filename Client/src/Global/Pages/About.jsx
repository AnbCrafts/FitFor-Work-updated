import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../../Seeker/assets/assets";

const About = () => {
  return (
    <div className="min-h-screen px-6 py-16 bg-[#F7F8FC] text-gray-800 w-[90%] mx-auto">

      {/* TITLE */}
      <h1 className="text-4xl font-bold text-center mb-14 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
        About <span className="text-gray-900">FitForWork</span>
      </h1>

      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white p-10 rounded-3xl shadow-md border border-gray-100">
        
        <div className="max-w-xl">
          <p className="text-lg leading-relaxed mb-8 text-gray-600">
            <strong className="text-purple-600">FitForWork</strong> is a modern,
            AI-driven job-seeking platform helping job seekers and employers
            connect faster, smarter, and more effectively. Whether you're a
            fresher or a working professional, FitForWork streamlines your hiring
            journey.
          </p>

          <Link
            className="py-3 px-8 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all"
            to="/"
          >
            Explore Our Platform
          </Link>
        </div>

        <div className="w-full md:w-[500px]">
          <img
            src={assets.aboutImg}
            className="rounded-2xl shadow-md w-full object-cover"
            alt="About FitForWork"
          />
        </div>
      </div>

      {/* JOURNEY SECTION */}
      <div className="mt-16 bg-white p-10 rounded-3xl shadow-md border border-gray-100">
        <h3 className="text-3xl font-semibold mb-8 text-purple-600">Our Journey</h3>

        <ul className="space-y-4 text-gray-700">
          <li>
            <span className="text-purple-500 font-semibold">🎯 2025:</span>{" "}
            FitForWork launched with a mission to simplify hiring.
          </li>
          <li>
            <span className="text-purple-500 font-semibold">🤖 2025 Q2:</span>{" "}
            AI-based smart job suggestions added.
          </li>
          <li>
            <span className="text-purple-500 font-semibold">📈 2025 Q3:</span>{" "}
            Reached 5k active users & 1k+ live job posts.
          </li>
          <li>
            <span className="text-purple-500 font-semibold">🌐 Future:</span>{" "}
            Expanding to global and remote-first hiring.
          </li>
        </ul>
      </div>

      {/* MISSION SECTION */}
      <div className="mt-16 bg-white p-10 rounded-3xl shadow-md border border-gray-100">
        <h3 className="text-3xl font-semibold mb-6 text-purple-600">🎯 Our Mission</h3>

        <p className="text-lg leading-relaxed text-gray-600">
          To bridge the gap between job seekers and employers using smart,
          data-driven technology — making job discovery personalized, fast, and
          accessible.
        </p>
      </div>

      {/* FEATURES */}
      <div className="mt-16 bg-white p-10 rounded-3xl shadow-md border border-gray-100">
        <h3 className="text-3xl font-semibold mb-6 text-purple-600">🚀 Platform Features</h3>

        <ul className="list-disc list-inside space-y-3 text-gray-600">
          <li>AI-powered smart job suggestions</li>
          <li>Separate dashboards for seekers, recruiters & admin</li>
          <li>Smart filtering by role, category, location & experience</li>
          <li>Clean and responsive SaaS UI design</li>
        </ul>
      </div>

      {/* TARGET AUDIENCE */}
      <div className="mt-16 bg-white p-10 rounded-3xl shadow-md border border-gray-100">
        <h3 className="text-3xl font-semibold mb-6 text-purple-600">🤝 Who We Help</h3>

        <ul className="list-disc list-inside text-gray-600 space-y-3 ml-2">
          <li>🎓 Job Seekers looking for skilled opportunities</li>
          <li>🏢 Employers searching for perfect candidates</li>
          <li>🛡️ Platform Admins ensuring smooth operations</li>
        </ul>
      </div>

      {/* CORE VALUES */}
      <div className="mt-16 bg-white p-10 rounded-3xl shadow-md border border-gray-100">
        <h3 className="text-4xl font-bold text-center mb-10 text-purple-600">
          Our Core Values
        </h3>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { emoji: "🔍", title: "Transparency" },
            { emoji: "🤝", title: "Trust" },
            { emoji: "🚀", title: "Innovation" },
            { emoji: "❤️", title: "User-First" },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-gray-200 text-center shadow-sm hover:shadow-md transition-all"
            >
              <p className="text-3xl mb-2">{item.emoji}</p>
              <p className="font-semibold text-gray-800 text-lg">{item.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                {item.title === "Transparency"
                  ? "Clear and honest communication."
                  : item.title === "Trust"
                  ? "Building dependable relationships."
                  : item.title === "Innovation"
                  ? "Using AI to simplify hiring."
                  : "Personalized experience for every user."}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* IMPACT SECTION */}
      <div className="mt-16 bg-white p-10 rounded-3xl shadow-md border border-gray-100">
        <h3 className="text-4xl font-bold mb-10 text-center text-purple-600">
          Our Impact So Far
        </h3>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-5 rounded-xl border border-purple-300">
            <p className="text-3xl font-bold text-purple-600">👥 5K+</p>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>

          <div className="p-5 rounded-xl border border-purple-300">
            <p className="text-3xl font-bold text-purple-600">📄 10K+</p>
            <p className="text-sm text-gray-600">Resumes Processed</p>
          </div>

          <div className="p-5 rounded-xl border border-purple-300">
            <p className="text-3xl font-bold text-purple-600">🏢 500+</p>
            <p className="text-sm text-gray-600">Companies Joined</p>
          </div>

          <div className="p-5 rounded-xl border border-purple-300">
            <p className="text-3xl font-bold text-purple-600">💡 1M+</p>
            <p className="text-sm text-gray-600">AI Suggestions</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 bg-gradient-to-r from-purple-600 to-indigo-600 p-12 rounded-3xl shadow-lg text-center text-white">
        <h3 className="text-3xl font-semibold mb-4">Ready to Find Your Next Opportunity?</h3>
        <p className="text-gray-100 mb-8">
          Whether you're a job seeker or an employer, FitForWork is built for you.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            to="/register"
            className="bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Register as Job Seeker
          </Link>

          <Link
            to="/recruiter"
            className="bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Join as Recruiter
          </Link>
        </div>
      </div>

      {/* Contact Bottom */}
      <div className="flex items-center justify-center gap-5 text-center mt-16 mx-auto">
        <p className="text-gray-700 text-lg">
          Still have something on your mind?
        </p>
        <Link
          to="/contact"
          className="px-6 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
};

export default About;

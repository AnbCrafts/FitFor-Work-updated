import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { AlarmCheck, ArrowLeft, Battery, Bell, CheckCircle, Circle, Clock, Filter, Lightbulb, Network, Phone, Search, TowerControl, User } from "lucide-react";
import JobCarousel from "./JobCarousel";
import PhoneUI from "./Phone";

export default function HeroSection() {
  return (
    <section className="w-[90%] mx-auto min-h-screen pt-32 pb-28 overflow-hidden relative">
        <div className="absolute shadow-2xl top-[50%] -translate-y-[50%] left-[50%] -translate-x-[50%] polygon w-xl aspect-square -z-40 bg-gray-100 ">

        </div>
        <div className="absolute shadow-2xl top-[50%] -translate-y-[50%] left-0 polygon w-2xl aspect-square -z-40 bg-gray-50 ">
{/* 
             <motion.img
          src={assets.floating3}
          alt="floating"
          className="absolute right-10 top-60 w-12 opacity-90 hidden md:block"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: false }}
        /> */}
        </div>
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">

        
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold leading-[1.2] text-[#111827]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: false }}
        >
          Search, Apply &  
          <span className="text-[#9333ea]"> Get Your Dream Job</span>
        </motion.h1>

        {/* =======================
            SUB TEXT
        ======================== */}
        <motion.p
          className="mt-6 max-w-2xl text-lg text-[#6B7280]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: false }}
        >
          Discover thousands of opportunities and get hired faster in your
          preferred career field with a seamless and user-friendly experience.
        </motion.p>

        {/* =======================
            CTA BUTTONS
        ======================== */}
        <motion.div
          className="mt-10 flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: false }}
        >
          <Link
            to="/jobs"
            className="px-8 py-3 rounded-lg bg-[#9333ea] text-white text-lg shadow-md hover:bg-purple-800 transition"
          >
            Browse Jobs
          </Link>

          <Link
            to="/how-it-works"
            className="px-8 py-3 rounded-lg border-2 border-[#FB7185] text-[#FB7185] text-lg hover:bg-[#FB7185] hover:text-white transition"
          >
            How It Works?
          </Link>
        </motion.div>

        {/* =======================
            FLOATING ICONS / ELEMENTS (OPTIONAL)
        ======================== */}
        <motion.img
          src={assets.floating1}
          alt="floating"
          className="absolute left-10 top-44 w-10 opacity-90 hidden md:block"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: false }}
        />

        <motion.img
          src={assets.floating2}
          alt="floating"
          className="absolute right-10 top-60 w-12 opacity-90 hidden md:block"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: false }}
        />
        

        {/* =======================
            CATEGORY PILLS (OPTIONAL)
        ======================== */}
        <motion.div
          className="mt-16 flex flex-wrap gap-3 justify-center max-w-3xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          viewport={{ once: false }}
        >
          {[
            "Full Stack Developer",
            "UI/UX Designer",
            "Backend Developer",
            "Marketing Manager",
            "Graphic Designer",
            "Accountant",
          ].map((item, idx) => (
            <span
              key={idx}
              className="px-5 py-2 bg-[#F3F4F6] border border-[#9333ea] rounded-full text-sm font-medium cursor-pointer hover:bg-[#9333ea] hover:text-[#fff] transition"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      <div>

      </div>

        <div className="relative mx-auto w-[350px]">

  {/* Phone UI */}
  <div className="relative w-fit mx-auto mt-20">

  {/* ===========================
        PHONE UI
  ============================ */}
  <div className="relative">
    <PhoneUI />
  </div>


  {/* ======================================================
        CALLOUT 1 — My Jobs (Left Top)
  ======================================================= */}
  <div className="absolute top-20 -left-56 flex items-center gap-3">

    {/* Label */}
    <div className="bg-white p-4 rounded-xl shadow-lg w-48 border border-gray-100">
      <h4 className="font-semibold text-gray-800 text-sm">My Jobs Section</h4>
      <p className="text-xs text-gray-600 mt-1">
        Easily track applications & saved jobs.
      </p>
    </div>

    {/* Dotted Arrow */}
    <svg width="80" height="40" viewBox="0 0 80 40">
      <path 
        d="M0 20 C40 0, 40 40, 80 20"
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
      />
    </svg>

  </div>


  {/* ======================================================
        CALLOUT 2 — Job Carousel (Right Middle)
  ======================================================= */}
  <div className="absolute top-64 -right-56 flex items-center gap-3">

    {/* Dotted Arrow (Right → Left) */}
    <svg width="100" height="40" viewBox="0 0 100 40">
      <path 
        d="M100 20 C60 0, 40 40, 0 20"
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
      />
    </svg>

    {/* Label */}
    <div className="bg-white p-4 rounded-xl shadow-lg w-48 border border-gray-100">
      <h4 className="font-semibold text-gray-800 text-sm">Job Carousel</h4>
      <p className="text-xs text-gray-600 mt-1">
        Featured jobs rotate every few seconds.
      </p>
    </div>

  </div>



  {/* ======================================================
        CALLOUT 3 — Resume Completion (Left Bottom)
  ======================================================= */}
  <div className="absolute top-[470px] -left-56 flex items-center gap-3">

    {/* Label */}
    <div className="bg-white p-4 rounded-xl shadow-lg w-48 border border-gray-100">
      <h4 className="font-semibold text-gray-800 text-sm">Resume Completion</h4>
      <p className="text-xs text-gray-600 mt-1">
        Boost your visibility with a complete profile.
      </p>
    </div>

    {/* Dotted Arrow */}
    <svg width="85" height="40" viewBox="0 0 85 40">
      <path 
        d="M0 20 C40 0, 40 40, 85 20"
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
      />
    </svg>

  </div>



  {/* ======================================================
        CALLOUT 4 — Tip of the Day (Right Bottom)
  ======================================================= */}
  <div className="absolute top-[580px] -right-56 flex items-center gap-3">

    {/* Dotted Arrow (Right → Left) */}
    <svg width="100" height="40" viewBox="0 0 100 40">
      <path 
        d="M100 20 C60 0, 40 40, 0 20"
        stroke="#9CA3AF"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
      />
    </svg>

    {/* Label */}
    <div className="bg-white p-4 rounded-xl shadow-lg w-48 border border-gray-100">
      <h4 className="font-semibold text-gray-800 text-sm">Tip of The Day</h4>
      <p className="text-xs text-gray-600 mt-1">
        Small tips that improve your hiring chances.
      </p>
    </div>

  </div>


</div>

</div>

      
     

    </section>
  );
}

import React from 'react'
import { AlarmCheck, ArrowLeft, Battery, Bell, CheckCircle, Circle, Clock, Filter, Lightbulb, Network, Search, TowerControl, User } from "lucide-react";
import JobCarousel from "./JobCarousel";

const PhoneUI = () => {
  return (
    <div className="relative w-[380px] h-[700px] mx-auto mt-10 rounded-[3rem] shadow-2xl bg-black p-2 border-[6px] border-[#1a1a1a] overflow-hidden">

  {/* INNER SCREEN WRAPPER */}
  <div className="w-full h-full bg-gray-50 rounded-[2.5rem] overflow-hidden relative">

    {/* --- iPhone Dynamic Island Section ---- */}
    <div className="w-full pt-3 px-4 flex flex-col items-center">

      {/* Dynamic Island Wrapper */}
      <div className="relative w-full flex justify-center mb-1">

        {/* Dynamic Island */}
        <div className="w-36 h-7 bg-black rounded-full shadow-lg relative flex items-center justify-center">
          <div className="absolute w-full h-full bg-black/40 rounded-full blur-md"></div>
        </div>

        {/* Camera Dot */}
        <div className="absolute left-[34%] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full"></div>
      </div>

      {/* Status Icons Row */}
      <div className="w-full flex items-center justify-between px-4 text-gray-700">
  {/* LEFT - time */}
  <div className="flex items-center gap-2">
    <span className="inline-flex items-center justify-center w-6 h-5">
      <Clock size={16} />
    </span>
    {/* optional time text */}
    <span className="text-sm font-medium text-gray-700">9:41</span>
  </div>

  {/* CENTER - dynamic island placeholder */}
  

  {/* RIGHT - clustered icons */}
  <div className="flex items-center gap-3 pb-2">
    <span className="inline-flex items-center justify-center w-6 h-5">
      <AlarmCheck size={16} />
    </span>

    <span className="inline-flex items-center justify-center w-6 h-5">
      <Network size={16} />
    </span>

    <span className="inline-flex items-center justify-center w-6 h-5">
      {/* Battery svg sometimes looks a bit lower — nudge it up */}
      <span className="inline-block -translate-y-[1px]">
        <Battery fill="7" size={18} />
      </span>
    </span>
  </div>
</div>

    </div>

    {/* --- ACTUAL SCREEN CONTENT GOES HERE ---- */}
    <div className="p-4 pt-6 pb-4 border border-gray-200 h-full">

  {/* ================================
      TOP NAV ROW
  ================================= */}
  <div className="flex items-center justify-between mb-6">

    {/* Left - Back Button */}
    <button className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition">
      <ArrowLeft size={20} className="text-purple-700" />
    </button>

    {/* Center Title */}
    <h1 className="text-xl font-semibold text-gray-800">My Jobs</h1>

    {/* Right Icons */}
    <div className="flex items-center gap-3">
      <Search size={20} className="text-purple-700" />
      <Bell size={20} className="text-purple-700" />
      <User size={20} className="text-purple-700" />
    </div>
  </div>

  {/* ================================
      FILTER ROW
  ================================= */}
  <div className="flex items-center justify-between mb-5">

    <div className="flex items-center gap-3">

      {/* Location */}
      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 border border-purple-600">
        Location
      </span>

      {/* Job Type */}
      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 border border-purple-600">
        Job Type
      </span>

    </div>

    {/* Filter Icon */}
    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
      <Filter size={20} className="text-gray-700" />
    </button>

  </div>


  {/* ================================
      JOB CARD WITH BACKGROUND IMAGE
  ================================= */}

        <div>
            <h1 className="text-sm text-gray-600">Recommended for you</h1>
      <JobCarousel/>    
        </div>

        {/* ================================
      APPLICATION STATUS TRACKER
================================ */}

{/* ================================
      TIP OF THE DAY CARD
================================ */}
<div className="mt-4 w-full bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">

  {/* Icon Bubble */}
  <div className="p-2 bg-white rounded-full shadow-sm">
    <User size={20} className="text-purple-600" />
  </div>

  {/* Content */}
  <div className="flex-1">
    <h3 className="text-sm font-semibold text-purple-700">Profile Completion</h3>

    {/* Description */}
    <p className="text-xs text-gray-700 mt-1">
      Complete your profile to improve your job match results.
    </p>

    {/* Progress Bar */}
    <div className="mt-3 w-full bg-purple-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-purple-600 rounded-full transition-all duration-500"
        style={{ width: "65%" }}   // <-- your progress percentage
      ></div>
    </div>

    {/* Percentage Text */}
    <p className="text-xs text-purple-700 font-medium mt-1">
      65% completed
    </p>
  </div>

</div>
<div className="mt-4 w-full bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">

  <div className="p-2 bg-white rounded-full shadow-sm">
    <Lightbulb size={20} className="text-purple-600" />
  </div>

  <div className="flex-1">
    <h3 className="text-sm font-semibold text-purple-700">Tip of the Day</h3>
    <p className="text-sm text-gray-700 mt-1 leading-snug">
      Customize your resume for each job role to increase your chances of getting shortlisted.
    </p>
  </div>

</div>





  

</div>


  </div>
</div>

  )
}

export default PhoneUI

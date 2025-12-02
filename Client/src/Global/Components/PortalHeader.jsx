import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import {Fingerprint, Pen} from 'lucide-react';

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
};

export default function PortalHeader() {
  return (
    <div className="p-3 bg-white/70 h-15 border-b border-t border-purple-200 flex items-center justify-between fixed w-[90%] left-[50%] z-[50000] -translate-x-[50%] top-5 rounded-lg shadow-xl">

      <Logo/>

      <div className="flex items-center justify-start gap-3 text-sm ">

     { ["Join Now","Start Hiring","Post a Job"].map((t,i)=>{
      return(
        <span className="text-gray-600 hover:text-purple-700 transition-all px-2 py-0.5 rounded border border-purple-100 cursor-pointer hover:shadow-2xl" key={i}>
          {t}
        </span>
      )
     })}
      </div>

      <div className=" flex items-center justify-start gap-5">
        
        <Link to={'/enroll'} className="hover:bg-purple-800 hover:text-white flex items-center justify-between p-2 text-lg rounded-lg gap-3 border-purple-600 border transition-all bg-purple-600 text-white">
        Register
        <Pen className="w-5 h-5 bg-white rounded-full text-purple-400 group-hover:text-pink-500 transition-colors p-0.5" />
        </Link>

        <Link to={'/enroll'} className="hover:bg-purple-600 hover:text-white flex items-center justify-between p-2 text-lg rounded-lg gap-3 border-purple-600 border transition-all">
        Login
        <Fingerprint className="w-5 h-5 bg-white rounded-full text-purple-400 group-hover:text-pink-500 transition-colors p-0.5" />
        </Link>

      </div>

    </div>
  );
}

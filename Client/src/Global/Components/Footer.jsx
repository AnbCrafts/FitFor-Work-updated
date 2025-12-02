import React from "react";
import Logo from "./Logo";
import { Mail, Phone, MapPin, Globe, Facebook, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-purple-800 text-gray-200 pt-16 pb-12  border-t border-purple-900/40">

      {/* Container */}
      <div className="w-[90%] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Logo + Desc */}
        <div>
          <Logo path="/" />
          <p className="text-sm text-gray-300 mt-4 leading-relaxed">
            FitForWork connects job seekers and employers through smart matching,
            real-time analytics, and a smooth, modern experience.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-white transition text-gray-300">
                Home
              </a>
            </li>
            <li>
              <a href="/jobs" className="hover:text-white transition text-gray-300">
                Find Jobs
              </a>
            </li>
            <li>
              <a href="/post-job" className="hover:text-white transition text-gray-300">
                Post a Job
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white transition text-gray-300">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Mail size={16} className="text-purple-200" /> support@fitforwork.com
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} className="text-purple-200" /> Dhanbad, Jharkhand, India
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} className="text-purple-200" /> +91 98765 43210
            </p>
          </div>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex items-center gap-4 text-purple-200">
            <a href="#" className="hover:text-white transition"><Globe size={20} /></a>
            <a href="#" className="hover:text-white transition"><Instagram size={20} /></a>
            <a href="#" className="hover:text-white transition"><Facebook size={20} /></a>
            <a href="#" className="hover:text-white transition"><Youtube size={20} /></a>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="w-[90%] mx-auto text-center text-xs text-gray-300 mt-12 border-t border-white/10 pt-5">
        © {new Date().getFullYear()} FitForWork · All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;

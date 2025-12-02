import React, { useEffect, useRef, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const Dropdown = ({ Links, def }) => {
  const { role, hash } = useParams();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(def.label);
  const [slug, setSlug] = useState(def.slug);
  const [navPath, setNavPath] = useState("");

  const dropdownRef = useRef(null);

  /* Build base navigation path */
  useEffect(() => {
    if (role && hash) setNavPath(`/auth/${role}/${hash}`);
  }, [role, hash]);

  /* Detect active link from URL */
  useEffect(() => {
    const current = location.pathname.split("/").pop();
    const found = Links.find((item) => item.slug === current);

    if (found) {
      setLabel(found.label);
      setSlug(found.slug);
    }
  }, [location.pathname]);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Click option */
  const selectItem = (item) => {
    setLabel(item.label);
    setSlug(item.slug);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-[200px]">
      {/* Dropdown Button */}
      <div
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between px-4 py-2 rounded-lg border 
        transition cursor-pointer bg-white
        border-gray-300 hover:border-purple-500`}
      >
        <span className="text-gray-700 font-medium truncate">{label}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-700 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown List */}
      {open && (
        <div
          className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 
          z-50 py-2 animate-fadeIn"
        >
          {Links.map((item, idx) => {
            const isActive = location.pathname.endsWith(item.slug);

            return (
              <Link
                key={idx}
                to={`${navPath}/${item.slug}`}
                onClick={() => selectItem(item)}
                className={`block px-4 py-2 text-sm rounded-md transition 
                ${
                  isActive
                    ? "bg-purple-100 text-purple-700 font-semibold"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

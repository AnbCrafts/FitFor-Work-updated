import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const NavPagesDropdown = () => {
  const { role, hash } = useParams();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Home");
  const [navPath, setNavPath] = useState("");

  const dropdownRef = useRef(null);

  const pages = [
    { label: "Home", slug: "" },
    { label: "About", slug: "about" },
    { label: "Contact", slug: "contact" },
    { label: "Services", slug: "service" },
    { label: "Help", slug: "help" },
  ];

  /* Base path */
  useEffect(() => {
    if (role && hash) setNavPath(`/auth/${role}/${hash}`);
  }, [role, hash]);

  /* Detect active page */
  useEffect(() => {
    const current = location.pathname.split("/").pop();
    const found =
      pages.find((p) => (p.slug === "" ? location.pathname === navPath : p.slug === current)) ||
      pages[0];

    setLabel(found.label);
  }, [location.pathname, navPath]);

  /* Click outside closes dropdown */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-[160px]">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition"
      >
        <span className="text-gray-700 font-medium">{label}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-700 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2 animate-fadeIn">
          {pages.map((item, idx) => {
            const active =
              item.slug === ""
                ? location.pathname === navPath
                : location.pathname.endsWith(item.slug);

            return (
              <Link
                key={idx}
                to={item.slug === "" ? navPath : `${navPath}/${item.slug}`}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm rounded-md transition 
                  ${
                    active
                      ? "bg-purple-100 text-purple-700 font-semibold"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  }
                `}
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

export default NavPagesDropdown;

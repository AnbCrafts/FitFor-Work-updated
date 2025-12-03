import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';
import { WorkContext } from '../../ContextAPI/WorkContext';

const Dropdown = ({ Links, def, position = "center" }) => {
  const { role, hash } = useParams();
  const location = useLocation();
  const { getUserIdByToken } = useContext(WorkContext);

  const [linkTxt, setLinkTxt] = useState(def.label);
  const [slug, setSlug] = useState(def.slug);
  const [toggleDropdown, setToggleDropdown] = useState(false);

  const navPath = `/auth/${role}/${hash}`;

  useEffect(() => {
    const currentSlug = location.pathname.split("/").pop();
    const found = Links.find(item => item.slug === currentSlug);
    if (found) {
      setLinkTxt(found.label);
      setSlug(found.slug);
    }
  }, [location.pathname]);

  const clickHandler = (item) => {
    setLinkTxt(item.label);
    setSlug(item.slug);
    setToggleDropdown(false);
  };


  return (
    <div className="relative w-[180px] select-none">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="bg-white border border-gray-300 px-4 py-2 rounded-lg flex items-center justify-between cursor-pointer hover:border-purple-500 transition"
      >
        <span className="text-gray-700 font-medium">{linkTxt}</span>
        <img
          src={toggleDropdown ? assets.up : assets.down}
          className="h-5 w-5 ml-2"
          alt="toggle"
        />
      </div>

      {/* DROPDOWN LIST */}
      {toggleDropdown && (
        <div
          className={`absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-full py-2 z-50 transition-all`}
          style={{
            left: position === "left" ? "0" : "auto",
            right: position === "left" ? "auto" : "0",
          }}
        >
          {Links.map((item, idx) => (
            <Link
              key={idx}
              to={`${navPath}/${item.slug}`}
              onClick={() => clickHandler(item)}
              className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};

export default Dropdown;

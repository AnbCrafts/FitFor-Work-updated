import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WorkContext } from '../../ContextAPI/WorkContext';

const Logo = ({ path, exit }) => {

  const { exitFromPlatform } = useContext(WorkContext);

  return (
    <Link
      to={path ? `${path}` : '/'}
      className="
        inline-block px-4 py-2 rounded-xl font-extrabold text-lg 
        bg-gradient-to-r from-purple-600 to-purple-500 
        text-white shadow-md transition hover:shadow-lg hover:scale-[1.03]
      "
    >
      <span className="text-white">Fit</span>
      <span className="text-purple-200">For</span>
      <span className="ml-1 text-white">Work</span>
    </Link>
  );
};

export default Logo;

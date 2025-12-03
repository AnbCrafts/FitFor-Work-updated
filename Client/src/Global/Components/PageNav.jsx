// PageNav.jsx (SaaS White + Purple UI)
import React from "react";

const PageNav = ({ currentPage = 1, totalPages = 1, incrementer = () => {} }) => {
  const prev = () => incrementer((p) => Math.max(1, p - 1));
  const next = () => incrementer((p) => Math.min(totalPages, p + 1));

  const pagesToShow = () => {
    const arr = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };

  return (
    <nav className="flex items-center justify-center gap-2 py-3">
      {/* Prev Button */}
      <button
        onClick={prev}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl border border-gray-300 bg-white 
                   text-gray-700 text-sm font-medium shadow-sm 
                   hover:bg-gray-100 transition-all disabled:opacity-40"
      >
        Prev
      </button>

      {/* Page Numbers */}
      {pagesToShow().map((p) => (
        <button
          key={p}
          onClick={() => incrementer(p)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm
            ${
              p === currentPage
                ? "bg-purple-600 text-white shadow-purple-300"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }
          `}
        >
          {p}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={next}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl border border-gray-300 bg-white 
                   text-gray-700 text-sm font-medium shadow-sm
                   hover:bg-gray-100 transition-all disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
};

export default PageNav;

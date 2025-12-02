// PageNav.jsx
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
    <nav className="flex items-center justify-center gap-3">
      <button
        onClick={prev}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border bg-white text-sm disabled:opacity-50"
      >
        Prev
      </button>

      {pagesToShow().map((p) => (
        <button
          key={p}
          onClick={() => incrementer(p)}
          className={`px-3 py-1 rounded-md text-sm ${
            p === currentPage ? "bg-purple-600 text-white" : "bg-white border"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={next}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border bg-white text-sm disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
};

export default PageNav;

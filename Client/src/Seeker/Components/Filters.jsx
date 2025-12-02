// Filters.jsx (fixed - grid layout, checkbox column locked, noScroll preserved)
import React from "react";



const Filters = ({ options = [], head = "" }) => {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6"
      role="region"
      aria-label={head}
    >
      {/* Heading */}
      <h2 className="text-base font-semibold text-gray-800 mb-3 leading-none">
        {head}
      </h2>

      {/* Scrollable list (keeps your global noScroll) */}
      <div className="max-h-[240px] overflow-y-auto noScroll">
        <div className="flex flex-col gap-1.5">
          {options && options.length === 0 && (
            <p className="text-sm text-gray-500">No items available</p>
          )}

          {options?.map((item, index) => {
            const labelText =
              typeof item === "object"
                ? item.companyName || item.name || item.label || JSON.stringify(item)
                : String(item);

            const id =
              typeof item === "object"
                ? item._id || `${head}-${index}`
                : `${head}-${labelText.replace(/\s+/g, "-").toLowerCase()}-${index}`;

            return (
              <div
                key={id}
                className="grid grid-cols-[28px_1fr] items-start gap-3 px-1 py-1 rounded-md hover:bg-gray-50"
              >
                {/* Checkbox column - fixed width */}
                <div className="flex items-start">
                  <input
                    id={id}
                    type="checkbox"
                    className="h-4 w-4 mt-0.5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-200"
                    aria-labelledby={`${id}-label`}
                  />
                </div>

                {/* Label column - flexible */}
                <label
                  id={`${id}-label`}
                  htmlFor={id}
                  className="text-sm text-gray-700 break-words leading-tight cursor-pointer"
                >
                  {labelText}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Filters;

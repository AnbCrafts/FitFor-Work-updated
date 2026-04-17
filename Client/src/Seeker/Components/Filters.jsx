import React, { useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

const Filters = ({ options = [], head = "", onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter options based on internal search
  const filteredOptions = options.filter((item) => {
    const val = item?._id || "";
    return val.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md mb-5 overflow-hidden">
      {/* Header with Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50/50 transition-colors"
      >
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {head}
        </h2>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} 
        />
      </button>

      <div 
        className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 pb-4">
          {/* Internal Search Bar - Only shows if list is long */}
          {options.length > 6 && (
            <div className="relative mb-3 group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder={`Search ${head.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-purple-200 focus:bg-white focus:ring-4 focus:ring-purple-50 transition-all"
              />
            </div>
          )}

          {/* Scrollable List */}
          <div className="max-h-[220px] overflow-y-auto pr-1 noScroll flex flex-col gap-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-gray-400 italic">No matches found</p>
              </div>
            ) : (
              filteredOptions.map((item, index) => {
                const val = item?._id;
                if (!val) return null;

                const id = `${head}-${index}`;

                return (
                  <label
                    key={id}
                    className="flex items-center w-full gap-3 cursor-pointer group p-2 rounded-xl hover:bg-purple-50 transition-all duration-200"
                  >
                    {/* Checkbox Container */}
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        id={id}
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-get-6 bg-gray-100 border border-gray-200 checked:bg-purple-600 checked:border-purple-600 focus:outline-none transition-all duration-300"
                        onChange={(e) => onFilterChange(head, item, e.target.checked)}
                      />
                      {/* Check Icon */}
                      <Check 
                        className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-300" 
                        strokeWidth={4} 
                      />
                    </div>

                    {/* Label Text */}
                    <span className="text-sm text-gray-600 group-hover:text-purple-700 font-medium transition-colors">
                      {val}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
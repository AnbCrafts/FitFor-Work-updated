import { Briefcase, Code, PenTool, ChartBar, UserCheck, Layers, Globe, Palette } from "lucide-react";

export default function JobCategories() {

  const categories = [
    { label: "Frontend Developer", icon: Code },
    { label: "UI/UX Designer", icon: PenTool },
    { label: "Project Manager", icon: UserCheck },
    { label: "Data Analyst", icon: ChartBar },
    { label: "Marketing", icon: Globe },
    { label: "Graphic Designer", icon: Palette },
    { label: "Full Stack Developer", icon: Layers },
    { label: "Business Analyst", icon: Briefcase },
  ];

  return (
    <section className="w-[90%] mx-auto mt-16">
      
      {/* TITLE */}
      <h2 className="text-xl font-semibold text-gray-800 mb-3">
        Popular Job Categories
      </h2>

      {/* SCROLLABLE CONTAINER */}
      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2">

        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className="
                flex items-center gap-2 px-4 py-2 
                bg-purple-50 border border-purple-200
                rounded-full cursor-pointer
                hover:border-purple-500 hover:text-purple-600
                transition whitespace-nowrap shadow-sm
              "
            >
              <Icon size={16} className="opacity-70 text-purple-600" />
              <span className="text-sm font-medium text-gray-800">{cat.label}</span>
            </div>
          );
        })}

      </div>
    </section>
  );
}

import { Users, BarChart2, Mail, FileText, Sparkles } from "lucide-react";

export default function EmployerToolsShowcase() {
  const tools = [
    {
      icon: Users,
      title: "Applicant Tracking",
      desc: "Sort, filter, review, and manage applicants in one clean dashboard.",
    },
    {
      icon: FileText,
      title: "Post & Manage Jobs",
      desc: "Create job listings, edit them anytime, and monitor performance.",
    },
    {
      icon: BarChart2,
      title: "Analytics Dashboard",
      desc: "Insights on job engagement, application quality, and reach.",
    },
    {
      icon: Mail,
      title: "Message Center",
      desc: "Communicate directly with candidates inside the hiring dashboard.",
    },
    {
      icon: Sparkles,
      title: "AI Talent Recommendations",
      desc: "Smart matching based on your job description & required skills.",
    },
  ];

  return (
    <section className="w-[90%] mx-auto mt-24">
      
      {/* HEADER */}
      <h2 className="text-3xl font-extrabold text-gray-900 text-center">
        Essential Tools For <span className="text-purple-600">Recruiters</span>
      </h2>
      
      <p className="text-center text-gray-500 mt-2 text-sm max-w-xl mx-auto">
        Everything you need to hire faster and more efficiently — in one modern employer dashboard.
      </p>

      {/* GRID CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">

        {tools.map((tool, i) => {
          const Icon = tool.icon;

          return (
            <div
              key={i}
              className="
                bg-purple-200 border border-purple-300 
                rounded-2xl p-6 shadow-md 
                hover:shadow-xl transition cursor-pointer
              "
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-purple-300 mb-4">
                <Icon size={24} className="text-purple-700" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900">
                {tool.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-700 mt-2 leading-snug">
                {tool.desc}
              </p>
            </div>
          );
        })}

      </div>
    </section>
  );
}

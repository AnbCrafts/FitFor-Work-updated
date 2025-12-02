import { Users, Rocket, ShieldCheck, LineChart } from "lucide-react";

export default function EmployerBenefits() {
  const benefits = [
    {
      icon: Users,
      title: "High-Quality Candidates",
      desc: "Reach verified, skill-matched professionals actively seeking opportunities.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Profiles",
      desc: "We filter out spam & fake applicants to ensure your postings stay clean.",
    },
    {
      icon: LineChart,
      title: "AI-Driven Shortlisting",
      desc: "Our intelligent system ranks candidates based on skill fit & experience.",
    },
    {
      icon: Rocket,
      title: "Faster Hiring Cycle",
      desc: "Post jobs, get applicants, shortlist, and hire — all in one modern dashboard.",
    },
  ];

  return (
    <section className="w-[90%] mx-auto mt-24 relative">

      {/* BG Accent */}
      <div className="absolute inset-0 -z-10 w-[70%] h-[280px] bg-purple-100 blur-[90px] opacity-30 mx-auto rounded-full"></div>

      {/* Header */}
      <h2 className="text-3xl font-extrabold text-gray-900 text-center leading-snug">
        Why Recruiters <span className="text-purple-600">Choose FitForWork</span>
      </h2>

      <p className="text-center text-gray-500 mt-2 text-sm max-w-xl mx-auto">
        A powerful hiring toolkit designed to help companies hire faster, smarter, and more efficiently.
      </p>

      {/* Content */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

        {/* LEFT: modern staggered illustration cards */}
        <div className="relative h-[340px]">

          {/* back floating box */}
          <div className="absolute left-8 top-14 bg-white border border-purple-200 shadow-md rounded-2xl p-6 w-56 rotate-[4deg]">
            <div className="text-sm font-semibold text-gray-800 mb-1">10,000+ Profiles</div>
            <p className="text-xs text-gray-600">Access talent across multiple industries.</p>
          </div>

          {/* front floating box */}
          <div className="absolute right-2 top-0 bg-white border border-purple-200 shadow-lg rounded-2xl p-6 w-60 rotate-[-3deg]">
            <div className="text-sm font-semibold text-gray-800 mb-1">AI Talent Match</div>
            <p className="text-xs text-gray-600">Speed up hiring with ranking-based matching.</p>
          </div>

          {/* bottom floating box */}
          <div className="absolute left-[20%] bottom-0 bg-white border border-purple-200 shadow-md rounded-2xl p-6 w-64 rotate-[2deg]">
            <div className="text-sm font-semibold text-gray-800 mb-1">Smart Filters</div>
            <p className="text-xs text-gray-600">Sort applicants by skills, experience & score.</p>
          </div>
        </div>

        {/* RIGHT: Benefit List */}
        <div className="space-y-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="
                  flex gap-4 bg-white border border-purple-200 rounded-xl p-5
                  shadow-sm hover:shadow-md transition cursor-pointer
                "
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Icon size={24} className="text-purple-600" />
                </div>

                <div>
                  <h3 className="text-md font-semibold text-gray-800">{b.title}</h3>
                  <p className="text-sm text-gray-600 leading-snug">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}

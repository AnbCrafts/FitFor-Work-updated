import { UserPlus, Search, FileUp, Handshake } from "lucide-react";

export default function FourSteps() {

  const steps = [
    {
      icon: UserPlus,
      title: "Create an Account",
      desc: "Set up your profile and start applying instantly."
    },
    {
      icon: Search,
      title: "Search Job",
      desc: "Browse personalized job recommendations easily."
    },
    {
      icon: FileUp,
      title: "Upload Resume",
      desc: "Add your CV for better employer visibility."
    },
    {
      icon: Handshake,
      title: "Get Hired",
      desc: "Receive offers faster with a strong profile."
    }
  ];

  return (
    <section className="w-[90%] mx-auto mt-20 relative bg-gray-50 py-10 min-h-[60vh] px-5 rounded-lg shadow">

      {/* TITLE */}
      <h2 className="text-2xl font-semibold text-center text-gray-900">
        Get Hired in 
        <span className="text-purple-600"> 4 Quick Easy Steps</span>
      </h2>
      <p className="text-center text-gray-500 text-sm mt-1">
        Follow the process shown below to find your perfect job.
      </p>

      {/* WAVE ARROW (SVG) */}
      <svg 
        className="mt-12 mx-auto w-full max-w-[900px] pointer-events-none"
        height="140" 
        viewBox="0 0 900 200"
      >
        <path 
          d="
            M 50 100
            C 200 20, 350 180, 450 100
            S 700 20, 850 100
          "
          stroke="#A78BFA"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="10 10"
        />
      </svg>

      {/* STEP CARDS ALIGNED ON THE WAVE */}
      <div className="relative mt-[-140px]">

        {/* STEP 1 (Left crest) */}
        <div className="absolute left-0 top-[-20px] w-40">
          <StepCard step={steps[0]} />
        </div>

        {/* STEP 2 (Right trough) */}
        <div className="absolute left-[30%] top-[90px] w-40">
          <StepCard step={steps[1]} />
        </div>

        {/* STEP 3 (Left crest again) */}
        <div className="absolute left-[60%] top-[-20px] w-40">
          <StepCard step={steps[2]} />
        </div>

        {/* STEP 4 (Right trough) */}
        <div className="absolute left-[83%] top-[90px] w-40">
          <StepCard step={steps[3]} />
        </div>

      </div>

      {/* Add spacing */}
      <div className="h-[200px]"></div>

    </section>
  );
}

/* Step Card Component */
function StepCard({ step }) {
  const Icon = step.icon;

  return (
    <div
      className="
        bg-white border border-purple-200 rounded-2xl p-4 
        shadow-sm hover:shadow-md hover:border-purple-500
        transition cursor-pointer
      "
    >
      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
        <Icon size={22} className="text-purple-600" />
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{step.title}</h3>
      <p className="text-xs text-gray-600 mt-1 leading-snug">{step.desc}</p>
    </div>
  );
}

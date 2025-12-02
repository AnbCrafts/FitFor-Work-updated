import { Sparkles, ShieldCheck, Rocket } from "lucide-react";

export default function WhyChoose() {

  const features = [
    {
      id: 1,
      icon: Sparkles,
      title: "Smart Job Matching",
      desc: "Our intelligent system recommends jobs tailored to your skills and profile.",
    },
    {
      id: 2,
      icon: ShieldCheck,
      title: "Verified Companies",
      desc: "We ensure listings come from trusted employers for your safety and reliability.",
    },
    {
      id: 3,
      icon: Rocket,
      title: "Fast Application Process",
      desc: "Apply for jobs seamlessly with a single tap and track updates instantly.",
    },
  ];

  return (
    <section className="w-[90%] mx-auto mt-16">

      {/* TITLE */}
      <h2 className="text-xl font-semibold text-gray-900 mb-5">
        Why Choose FitForWork?
      </h2>

      {/* FEATURE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map((f) => {
          const Icon = f.icon;

          return (
            <div
              key={f.id}
              className="
                bg-white border border-purple-200 p-5 rounded-xl 
                shadow-sm hover:shadow-md transition 
                hover:border-purple-500 cursor-pointer
              "
            >
              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-center 
                              bg-purple-100 rounded-xl mb-4">
                <Icon size={26} className="text-purple-600" />
              </div>

              {/* Title */}
              <h3 className="text-md font-semibold text-gray-800">
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mt-1 leading-snug">
                {f.desc}
              </p>

            </div>
          );
        })}
      </div>

    </section>
  );
}

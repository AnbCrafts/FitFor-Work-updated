import { CheckCircle, Building2, Crown, Users } from "lucide-react";

export default function EmployerPricing() {
  const plans = [
    {
      id: 1,
      title: "Starter",
      icon: Building2,
      price: "₹499",
      duration: "per job post",
      features: [
        "1 Job Posting",
        "Standard Visibility",
        "Basic Candidate Filters",
        "Email Notifications",
      ],
      popular: false,
      rotate: "-2deg",
    },
    {
      id: 2,
      title: "Pro",
      icon: Crown,
      price: "₹1499",
      duration: "per job post",
      features: [
        "3 Job Postings",
        "Highlighted Visibility",
        "AI Candidate Ranking",
        "Full Message Center Access",
        "Premium Support",
      ],
      popular: true,
      rotate: "0deg",
    },
    {
      id: 3,
      title: "Enterprise",
      icon: Users,
      price: "₹4999",
      duration: "per month",
      features: [
        "Unlimited Job Posts",
        "Top-tier Visibility",
        "Advanced Analytics",
        "Dedicated Hiring Manager",
        "Priority Support",
      ],
      popular: false,
      rotate: "2deg",
    },
  ];

  return (
    <section className="w-[90%] mx-auto mt-32 relative">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Flexible Pricing for <span className="text-purple-600">Growing Teams</span>
        </h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
          Choose a plan that fits your hiring needs — from a single job post
          to a complete hiring suite.
        </p>
      </div>

      {/* Purple glow background */}
      <div className="absolute inset-0 -z-10 w-[70%] h-[300px] bg-purple-200 blur-[110px] opacity-30 mx-auto mt-20"></div>

      {/* Pricing Cards (Staggered Layout) */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 relative">

        {plans.map((p) => {
          const Icon = p.icon;

          return (
            <div
              key={p.id}
              className={`
                bg-white rounded-2xl shadow-lg border
                ${p.popular ? "border-purple-500 shadow-xl" : "border-purple-200"}
                p-8 flex flex-col gap-5 transition
                hover:shadow-2xl cursor-pointer
              `}
              style={{
                transform: `rotate(${p.rotate})`,
              }}
            >
              {/* Popular Tag */}
              {p.popular && (
                <div className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full w-fit font-semibold mb-1">
                  Most Popular
                </div>
              )}

              {/* Icon + Title */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Icon size={24} className="text-purple-600" />
                </div>

                <h3 className="text-xl font-semibold text-gray-800">
                  {p.title}
                </h3>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-3xl font-extrabold text-gray-900">
                  {p.price}
                </h4>
                <p className="text-xs text-gray-500">{p.duration}</p>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-2 mt-2">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-purple-600" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                className={`
                  w-full py-2 rounded-xl mt-5 font-semibold transition
                  ${p.popular
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"}
                `}
              >
                Choose Plan
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

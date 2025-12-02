import { assets } from "../../assets/assets";

export default function FeaturedCompanies() {

  const companies = [
    { name: "Google", logo: assets.google },
    { name: "Microsoft", logo: assets.microsoft },
    { name: "Amazon", logo: assets.amazon },
    { name: "Netflix", logo: assets.netflix },
    { name: "Meta", logo: assets.meta },
    { name: "Figma", logo: assets.figma },
  ];

  return (
    <section className="w-[90%] mx-auto mt-24">
      
      {/* BADGE */}
      <div className="mx-auto w-fit px-4 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
        Trusted Companies
      </div>

      {/* TITLE */}
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mt-3 leading-snug">
        Hire Faster With  
        <span className="text-purple-600"> Leading Global Companies</span>
      </h2>

      {/* SUBTITLE */}
      <p className="text-center text-gray-500 mt-3 text-sm max-w-xl mx-auto">
        FitForWork is proudly partnered with some of the world’s most respected and innovative companies.
      </p>

      {/* BACKGROUND DECOR */}
      <div className="relative mt-14">
        <div className="absolute inset-0 -z-10 mx-auto w-[60%] h-[200px] bg-purple-100 blur-[100px] opacity-40 rounded-full"></div>
      </div>

      {/* STAGGERED FANCY CARDS */}
      <div className="relative mt-10 grid grid-cols-2 sm:grid-cols-3 gap-8">

        {companies.map((c, i) => (
          <div
            key={i}
            className={`
              bg-white border border-purple-200 shadow-md rounded-2xl
              p-6 flex flex-col items-center justify-center gap-4
              hover:shadow-xl hover:border-purple-500 transition cursor-pointer
              ${i % 2 !== 0 ? "translate-y-4" : "-translate-y-4"} 
            `}
          >
            {/* LOGO */}
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-50 border border-purple-200">
              <img 
                src={c.logo} 
                alt={c.name} 
                className="h-6 object-contain"
              />
            </div>

            {/* NAME */}
            <p className="text-sm font-semibold text-gray-800">{c.name}</p>

            {/* SMALL TAG */}
            <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-200">
              Partner
            </span>
          </div>
        ))}

      </div>

      {/* DECORATIVE BOTTOM LINE */}
      <div className="mt-12 w-full flex justify-center">
        <div className="h-[3px] w-32 bg-purple-200 rounded-full"></div>
      </div>

    </section>
  );
}

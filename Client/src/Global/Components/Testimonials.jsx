import React from "react";
import { Star } from "lucide-react";
import { assets } from "../../assets/assets";

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Frontend Engineer",
      company: "Figma",
      avatar: assets.admin,
      quote:
        "FitForWork helped me find a role that matched my exact skillset. The application flow was smooth and I got interviews within days.",
      rating: 5,
    },
    {
      id: 2,
      name: "Rohan Mehta",
      role: "Product Designer",
      company: "Meta",
      avatar: assets.hero,
      quote:
        "The curated job recommendations are excellent — fewer irrelevant listings and more quality matches.",
      rating: 5,
    },
    {
      id: 3,
      name: "Ananya Roy",
      role: "Data Analyst",
      company: "Spotify",
      avatar: assets.hero,
      quote:
        "I completed my profile and saw a noticeable uplift in responses. The UI is delightful and the process is fast.",
      rating: 4,
    },
  ];

  return (
    <section className="w-[90%] mx-auto mt-24">

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-fit px-4 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
          What People Say
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mt-4">
          Trusted by job-seekers across the world
        </h2>

        <p className="text-gray-500 mt-2 max-w-2xl mx-auto text-sm">
          Hear from users who found meaningful work through FitForWork — real stories, real outcomes.
        </p>
      </div>

      {/* Cards Container */}
      <div className="relative mt-14 max-w-5xl mx-auto flex flex-col md:flex-row md:items-start md:justify-center gap-6">

        {/* Card 1 */}
        <article className="
          bg-white border border-purple-100 rounded-2xl p-5 shadow-md 
          hover:shadow-lg transition w-full md:w-[30%]
          md:translate-y-0
        ">
          <QuoteCard testimonial={testimonials[0]} />
        </article>

        {/* Card 2 - Center prominent */}
        <article className="
          bg-white border border-purple-100 rounded-2xl p-6 shadow-xl 
          hover:shadow-2xl transition w-full md:w-[35%]
          md:-translate-y-6 md:scale-105
        ">
          <QuoteCard testimonial={testimonials[1]} prominent />
        </article>

        {/* Card 3 */}
        <article className="
          bg-white border border-purple-100 rounded-2xl p-5 shadow-md 
          hover:shadow-lg transition w-full md:w-[28%]
          md:translate-y-3
        ">
          <QuoteCard testimonial={testimonials[2]} />
        </article>

      </div>

      {/* Carousel dots */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-8 bg-purple-600 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
        </div>

        <div className="text-sm text-gray-500">3 testimonials • Verified users</div>
      </div>

    </section>
  );
}

function QuoteCard({ testimonial, prominent = false }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover border border-purple-100"
          />
          <div>
            <div className="text-sm font-semibold text-gray-800">{testimonial.name}</div>
            <div className="text-xs text-gray-500">
              {testimonial.role} • <span className="text-gray-600">{testimonial.company}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < testimonial.rating ? "text-purple-600" : "text-gray-300"}
            />
          ))}
        </div>
      </div>

      {/* Quote */}
      <blockquote className="text-sm text-gray-700 leading-snug">
        “{testimonial.quote}”
      </blockquote>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-gray-400">Posted 2 months ago</div>
        <div className="text-xs text-purple-600 font-medium">Read more →</div>
      </div>
    </div>
  );
}

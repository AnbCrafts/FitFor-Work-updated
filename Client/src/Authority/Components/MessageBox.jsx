import React from "react";

const MessageBox = () => {
  return (
    <section className="bg-white text-gray-800 py-14 px-5 mt-10 rounded-2xl w-[90%] mx-auto shadow-lg border border-gray-200">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-3 text-purple-600">
          📬 Stay Connected
        </h2>
        <p className="text-gray-600 mb-10">
          Have feedback, questions, or complaints? Fill out the form below and
          we’ll get back to you shortly.
        </p>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="p-3 rounded-xl bg-gray-50 text-gray-900 border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            className="p-3 rounded-xl bg-gray-50 text-gray-900 border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
            required
          />

          {/* Subject */}
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            className="p-3 rounded-xl bg-gray-50 text-gray-900 border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition md:col-span-2"
            required
          />

          {/* Message */}
          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            className="p-3 rounded-xl bg-gray-50 text-gray-900 border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition md:col-span-2"
            required
          ></textarea>

          {/* Button */}
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 transition text-white font-semibold py-3 px-6 rounded-xl md:col-span-2 shadow-md"
          >
            🚀 Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default MessageBox;

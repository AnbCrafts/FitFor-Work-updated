import React from "react";

const Contact_ = () => {
  return (
    <div className="min-h-screen px-6 py-16 bg-[#F7F8FC] w-[90%] mx-auto text-gray-800">

      {/* Heading */}
      <h1 className="text-4xl font-bold text-center mb-14 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
        Contact <span className="text-gray-900">Us</span>
      </h1>

      {/* CONTACT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
        
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold text-purple-600 mb-2">📧 Email</h3>
          <p className="text-gray-600 break-all">support@fitforwork.ai</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold text-purple-600 mb-2">📞 Phone</h3>
          <p className="text-gray-600">+91 98765 43210</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold text-purple-600 mb-2">📍 Address</h3>
          <p className="text-gray-600">123 AI Avenue, Tech City, India 700001</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-all">
          <h3 className="text-xl font-semibold text-purple-600 mb-3">🌐 Social</h3>
          <div className="flex justify-center gap-4 text-gray-600 text-sm">
            <a href="#" className="hover:text-purple-700">LinkedIn</a>
            <a href="#" className="hover:text-purple-700">Instagram</a>
            <a href="#" className="hover:text-purple-700">Twitter</a>
          </div>
        </div>

      </div>

      {/* CONTACT FORM */}
      <form className="bg-white p-10 rounded-3xl shadow-md border border-gray-200 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-purple-600">
          📩 Send Us a Message
        </h2>

        {/* Name */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700 font-medium">Your Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700 font-medium">Your Email</label>
          <input
            type="email"
            placeholder="john@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700 font-medium">Your Message</label>
          <textarea
            rows="5"
            placeholder="Type your message here..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none transition-all"
          ></textarea>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md"
        >
          Send Message
        </button>
      </form>

      {/* Disclaimer */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        We'll get back to you within 24–48 hours.
      </div>
    </div>
  );
};

export default Contact_;

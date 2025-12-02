import React from 'react';

const MessageBox = () => {
  return (
    <section className="w-[90%] mx-auto mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm py-14 px-6">
      <div className="max-w-4xl mx-auto text-center">
        
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          📬 Stay Connected
        </h2>

        <p className="text-gray-600 mb-10">
          Have questions, feedback, or need support?  
          Send us a message — we typically reply within 24 hours.
        </p>

        {/* Form */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="p-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            className="p-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition"
            required
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            className="p-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition md:col-span-2"
            required
          />

          <textarea
            name="message"
            rows="5"
            placeholder="Write your message here..."
            className="p-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none transition md:col-span-2"
            required
          ></textarea>

          <button
            type="submit"
            className="md:col-span-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition shadow-sm"
          >
            🚀 Send Message
          </button>

        </form>

      </div>
    </section>
  );
};

export default MessageBox;

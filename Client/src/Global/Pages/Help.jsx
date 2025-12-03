import React from "react";
import { Link } from "react-router-dom";

const Help = () => {
  return (
    <div className="min-h-screen px-6 py-16 bg-[#F7F8FC] w-[90%] mx-auto text-gray-800">

      {/* Heading */}
      <h1 className="text-4xl font-bold text-center mb-14 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
        Need Help? We're Here for You!
      </h1>

      {/* FAQ Section */}
      <div className="bg-white p-10 rounded-3xl shadow-md border border-gray-200 mb-14">
        <h2 className="text-3xl font-semibold mb-6 text-purple-600">
          🧐 Frequently Asked Questions
        </h2>

        <div className="space-y-6 text-gray-700 text-md">
          {/* Q1 */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              ❓ How do I apply for a job?
            </p>
            <p className="text-gray-600">
              Go to the Jobs page, apply filters, and click "Apply" for your
              desired job.
            </p>
          </div>

          {/* Q2 */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              ❓ Is uploading a resume necessary?
            </p>
            <p className="text-gray-600">
              Yes, it enables our AI to recommend jobs suited to your skills.
            </p>
          </div>

          {/* Q3 */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              ❓ How can I contact an employer?
            </p>
            <p className="text-gray-600">
              Employers can contact you directly through email or in-app
              messages once you apply.
            </p>
          </div>

          {/* Q4 */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              ❓ I'm a recruiter. How do I post a job?
            </p>
            <p className="text-gray-600">
              Log in to your recruiter dashboard and click on “Post a Job”.
            </p>
          </div>
        </div>
      </div>

      {/* CONTACT SUPPORT BOX */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-12 rounded-3xl text-center shadow-lg text-white">
        <h2 className="text-3xl font-bold mb-4">📩 Still Need Help?</h2>
        <p className="text-gray-100 mb-8">
          If your issue isn’t covered above, feel free to contact our support
          team. We respond within 24 hours.
        </p>

        <Link
          to="chat"
          className="px-8 py-3 bg-white text-purple-700 rounded-xl font-semibold hover:bg-gray-200 transition-shadow shadow-md"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default Help;

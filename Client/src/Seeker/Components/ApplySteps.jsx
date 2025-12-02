// ApplySteps.jsx
import React from "react";

const steps = [
  { title: "Complete Profile", desc: "Add experience, skills & resume." },
  { title: "Match Jobs", desc: "View jobs matched for your profile." },
  { title: "Apply", desc: "Apply and track application status." },
];

const ApplySteps = () => {
  return (
    <aside className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-3">Quick Guide</h4>
      <ol className="space-y-3 text-sm text-gray-700">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
              {i + 1}
            </div>
            <div>
              <div className="font-medium text-gray-900">{s.title}</div>
              <div className="text-xs text-gray-600">{s.desc}</div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4">
        <button className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
          Improve Resume
        </button>
      </div>
    </aside>
  );
};

export default ApplySteps;

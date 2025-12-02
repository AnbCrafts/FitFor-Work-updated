import React from "react";
import { jobSeekerNotifications } from "../assets/NotificationDB";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

const Notification = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto mb-10 flex items-center justify-center gap-3">
        <Bell className="w-10 h-10 text-purple-600" />
        <h1 className="text-4xl font-bold text-gray-900">
          Notifications
        </h1>
      </div>

      {/* Notification List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {jobSeekerNotifications.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border shadow-sm p-5 bg-white transition hover:shadow-md ${
              item.isRead
                ? "border-gray-200"
                : "border-purple-300 shadow-purple-100"
            }`}
          >
            {/* Title + Icon */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{item.icon}</span>
              <h2 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {item.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {new Date(item.timestamp).toLocaleString()}
              </p>

              {item.actionLink && (
                <Link
                  to={item.actionLink}
                  className="text-sm font-medium text-purple-600 hover:text-purple-800 transition"
                >
                  {item.actionText} →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (optional future condition) */}
      {jobSeekerNotifications.length === 0 && (
        <div className="text-center mt-20 text-gray-500">
          No notifications yet.
        </div>
      )}
    </div>
  );
};

export default Notification;

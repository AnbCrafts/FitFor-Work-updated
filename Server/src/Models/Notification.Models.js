import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    // --- IDENTITY ---
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Can be Seeker, Authority, or Admin
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Optional: System-generated notifications might not have a senderId
    },

    // --- UI/UX RENDERING LOGIC ---
    triggerEvent: {
      type: String,
      required: true,
      enum: [
        "APP_RECEIVED",      // Authority sees new applicant
        "STATUS_UPDATED",    // Seeker sees (Shortlisted/Rejected)
        "NEW_MATCHING_JOB",  // AI-driven job alert
        "SUPPORT_TICKET",    // User sent issue to Admin
        "TICKET_RESOLVED",   // Admin replied to User
        "SYSTEM_ALERT"       // General announcement
      ],
      index: true,
    },

    // --- CONTENT ---
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    // --- DYNAMIC DATA (THE "POWER" FIELD) ---
    // This allows the Frontend to build custom "Action Buttons"
    // e.g., if event is APP_RECEIVED, metaData contains { jobId, applicantId }
    metaData: {
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Applicant" },
      externalLink: String,
      priority: { type: String, enum: ["low", "medium", "high"], default: "low" }
    },

    // --- STATUS & TRACKING ---
    isRead: { type: Boolean, default: false, index: true },
    isClicked: { type: Boolean, default: false }, // Tracks if the user actually opened the link
    
    // Support Ticket Specifics
    status: {
      type: String,
      enum: ["pending", "in-review", "resolved", "closed", "not-applicable"],
      default: "not-applicable",
    },

    attachments: [{ type: String }], // URLs to screenshots for bugs/complaints
  },
  { timestamps: true }
);

// Performance: Index for fast "Unread" count badge
NotificationSchema.index({ recipientId: 1, isRead: 1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
export default Notification;
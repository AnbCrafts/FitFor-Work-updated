import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // --- CORE RELATIONS ---
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true // Performance: Essential for loading a specific chat history
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    // --- CONTENT & TYPE ---
    content: {
      type: String,
      required: true,
      trim: true
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"], // "system" for "Interview Scheduled" alerts
      default: "text"
    },
    fileUrl: {
      type: String, // For attachments
    },

    // --- STATUS TRACKING ---
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent"
    },
    readAt: {
      type: Date // Management: Analytics on employer responsiveness
    },

    // --- CONTEXT (Optional but Pro) ---
    relatedApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Applicant", // Links the chat to a specific job application
      index: true
    }
  },
  { timestamps: true }
);

// Performance: Compound index to fetch chat history in chronological order
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
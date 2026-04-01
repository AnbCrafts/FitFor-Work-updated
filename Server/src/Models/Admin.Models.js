import mongoose from "mongoose";
import { ADMIN_PERMISSIONS } from "../Constants/AdminPermissions.Constant.js";

const AdminSchema = new mongoose.Schema({
  // --- CORE IDENTITY ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true // Performance: Fast lookup for session validation
  },
  adminName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // --- SECURITY LAYER ---
  secretCode: {
    type: String,
    required: true,
    select: false // Security: Never return the secret code in API responses
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false // Production: Essential for high-privilege accounts
  },

  // --- ROLE-BASED ACCESS CONTROL (RBAC) ---
  accessLevel: {
    type: String,
    enum: ["SuperAdmin", "Moderator", "Support"],
    default: "Moderator",
    index: true
  },
  permissions: {
    type: [String],
    enum: ADMIN_PERMISSIONS,
    default: []
  },

  // --- ACTIVITY & AUDITING ---
  actionLog: [{
    action: String, // e.g., "BLOCKED_USER", "VERIFIED_COMPANY"
    targetId: mongoose.Schema.Types.ObjectId, // ID of the entity affected
    timestamp: { type: Date, default: Date.now }
  }],
  
  sentNotifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
  }],

  // --- MANAGEMENT ---
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin" // Tracks which SuperAdmin created this Moderator account
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Performance: Index for Admin Dashboard filtering by access level
AdminSchema.index({ accessLevel: 1, isActive: 1 });

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;
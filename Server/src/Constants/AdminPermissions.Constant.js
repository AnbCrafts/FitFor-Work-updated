/**
 * ADMIN_PERMISSIONS defines the granular actions an admin can take.
 * Grouping them helps in building a clean UI for the Admin Management panel.
 */

export const ADMIN_PERMISSIONS = [
  // --- USER MANAGEMENT ---
  "USER_VIEW",
  "USER_BLOCK",
  "USER_DELETE",
  "USER_VERIFY",

  // --- JOB MODERATION ---
  "JOB_VIEW",
  "JOB_APPROVE", // For "Pending Review" status
  "JOB_EDIT",
  "JOB_DELETE",
  "JOB_FLAG",

  // --- EMPLOYER/AUTHORITY MANAGEMENT ---
  "AUTHORITY_VIEW",
  "AUTHORITY_VERIFY", // Giving the "Blue Tick"
  "AUTHORITY_BLOCK",
  "AUTHORITY_EDIT_STATS",

  // --- APPLICATION TRACKING ---
  "APP_VIEW_ALL",
  "APP_AUDIT_LOGS",

  // --- SUPPORT & NOTIFICATIONS ---
  "NOTIF_SEND_GLOBAL",
  "NOTIF_SEND_USER",
  "TICKET_RESOLVE",
  "TICKET_VIEW",

  // --- SYSTEM & ADMIN ---
  "ADMIN_MANAGE", // Ability to create/delete other admins (SuperAdmin only)
  "SYSTEM_SETTINGS_EDIT",
  "VIEW_ANALYTICS_DASHBOARD"
];

/**
 * Default Permission Sets based on Access Level
 * Useful for auto-populating permissions when creating a new Admin
 */
export const ROLE_PERMISSIONS = {
  SuperAdmin: ADMIN_PERMISSIONS, // Gets everything
  
  Moderator: [
    "USER_VIEW", "USER_BLOCK", "USER_VERIFY",
    "JOB_VIEW", "JOB_APPROVE", "JOB_FLAG",
    "AUTHORITY_VIEW", "AUTHORITY_VERIFY",
    "APP_VIEW_ALL", "TICKET_VIEW"
  ],
  
  Support: [
    "USER_VIEW", 
    "JOB_VIEW", 
    "TICKET_VIEW", 
    "TICKET_RESOLVE", 
    "NOTIF_SEND_USER"
  ]
};
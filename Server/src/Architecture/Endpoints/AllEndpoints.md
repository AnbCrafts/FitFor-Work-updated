<!-- ADMIN -->

Category,Method,Endpoint,Description,Permission Required
Auth & Profile,POST,/admin/login,Secure login with secretCode + JWT generation.,N/A (Public)
,GET,/admin/me,Fetch current admin's profile and permissions.,ANY_ADMIN
,PATCH,/admin/update-password,Update secret code/password.,ANY_ADMIN
Admin Mgmt,POST,/admin/create,Create a new Moderator/Support account.,ADMIN_MANAGE
,GET,/admin/all,List all staff accounts with their activity status.,ADMIN_MANAGE
,DELETE,/admin/:id,Revoke admin access/Delete staff account.,ADMIN_MANAGE
User Control,GET,/admin/users,List all Seekers/Authorities (with pagination/filters).,USER_VIEW
,PATCH,/admin/users/:id/status,Block/Unblock or Verify a user account.,USER_BLOCK / USER_VERIFY
,GET,/admin/users/:id/logs,View activity history of a specific user.,USER_VIEW
Authority Mgmt,GET,/admin/authorities/pending,"List companies waiting for ""Blue Tick"" verification.",AUTHORITY_VIEW
,PATCH,/admin/authorities/:id/verify,Approve/Reject company verification request.,AUTHORITY_VERIFY
,PATCH,/admin/authorities/:id/trust,Manually adjust a company's trustScore.,AUTHORITY_EDIT_STATS
Job Moderation,GET,/admin/jobs/flagged,View jobs reported by users or flagged by AI.,JOB_VIEW
,DELETE,/admin/jobs/:id,Force delete a job post (Spam/Fraud).,JOB_DELETE
,PATCH,/admin/jobs/:id/status,"Change job status (e.g., to ""Paused"").",JOB_APPROVE
Support/Tickets,GET,/admin/tickets,View all user complaints/bug reports.,TICKET_VIEW
,PATCH,/admin/tickets/:id,Update ticket status (Pending -> Resolved).,TICKET_RESOLVE
,POST,/admin/notifications/broadcast,Send a notification to ALL users (System Announcement).,NOTIF_SEND_GLOBAL
Analytics,GET,/admin/stats/overview,"Total users, jobs, hires, and platform revenue.",VIEW_ANALYTICS_DASHBOARD




<!-- User -->


Category,Method,Endpoint,Description,Production Requirement
Authentication,POST,/auth/signup,Register a new account (Default: Seeker).,Validation (Zod/Joi) + Password Hashing
,POST,/auth/login,Email/Password check + JWT/Cookie issuance.,Rate Limiting (Prevents Brute Force)
,POST,/auth/logout,Clear cookies and invalidate Refresh Token.,Secure Token Rotation
,POST,/auth/refresh,Issue a new Access Token using a Refresh Token.,HttpOnly Cookies
Verification,POST,/auth/verify-email,Verify OTP sent to the user's email.,"OTP Expiry Logic (e.g., 5 mins)"
,POST,/auth/forgot-password,Request a password reset link/OTP.,SMTP Integration (Nodemailer)
,PATCH,/auth/reset-password,Set a new password using a valid token/OTP.,Password Strength Check
Profile,GET,/users/me,Get the logged-in user's data (Self).,Exclude password & otp fields
,PATCH,/users/update-me,"Update basic info (Name, Picture, Bio).",Multi-part Form Data (Multer)
,DELETE,/users/deactivate,"Soft-delete account (Set status to ""Inactive"").",Audit Trail Entry
Security,PATCH,/users/change-password,Update password while logged in.,Old Password Validation
,GET,/users/sessions,View active login sessions/devices.,Device Fingerprinting
Public Info,GET,/users/:username,"Public profile view (e.g., for portfolios).",Restricted Data View



<!-- Seeker -->

Category,Method,Endpoint,Description,Production Requirement
Profile,POST,/seeker/profile,"Initialize professional profile (Skills, Exp).",First-time Setup Wizard
,GET,/seeker/profile/me,Fetch detailed professional profile.,Populate userId data
,PATCH,/seeker/profile/update,"Update professional details (Skills, CTC, etc).",Atomic updates to skills array
Resume,POST,/seeker/resume/upload,Upload PDF Resume to Cloud Storage.,Multer + S3/Cloudinary
,GET,/seeker/resume/analyze,AI: Extract text from Resume for Matching.,Gemini/OpenAI API + PDF-Parse
Job Search,GET,/seeker/jobs,"Search & Filter jobs (by Salary, Role, Exp).",MongoDB Atlas Search (Fuzzy)
,GET,/seeker/jobs/recommended,AI: Get jobs matching Seeker skills.,Vector Search / Filtering Logic
,GET,/seeker/jobs/:id,View full job details.,Increment views in Job Schema
Interactions,POST,/seeker/jobs/:id/apply,Apply for a job + Create Applicant record.,Generate ABC-FFW-001 ID
,PATCH,/seeker/jobs/:id/save,Add/Remove job from savedJobs list.,Toggle Logic ($addToSet / $pull)
Tracking,GET,/seeker/applications,View all applied jobs with current status.,Denormalized Metadata Cards
,GET,/seeker/applications/:id,View detailed tracking of a specific application.,Populate companyId for UI
Analytics,GET,/seeker/dashboard/stats,"View total applications, profile views, etc.",Aggregation Pipeline


<!-- Authority -->

Category,Method,Endpoint,Description,Production Requirement
Profile,POST,/authority/profile,"Setup company profile (Logo, Website, Size).",Verification Middleware
,GET,/authority/me,Fetch company profile and active stats.,Populate owner details
,PATCH,/authority/update,Update company info and Branding colors.,Dynamic Theme Support
Job Management,POST,/authority/jobs,Create a new Job Post.,Counter Schema logic
,GET,/authority/jobs,List all jobs posted by this company.,Pagination + Status Filter
,PATCH,/authority/jobs/:id,Edit job details or change status (Open/Closed).,Role-Based Check (Owner only)
,DELETE,/authority/jobs/:id,Soft-delete a job post.,Archive Logic (Don't hard delete)
Applicant Tracking,GET,/authority/applicants,View ALL applicants across all jobs.,High-performance Lookups
,GET,/authority/jobs/:id/applicants,View applicants for a specific job.,Sort by matchPercentage
,GET,/authority/applicants/:id,View a seeker's full profile + AI Match Score.,Populated seekerId
Workflow Actions,PATCH,/authority/applicants/:id/status,Update status (Shortlist/Reject/Hire).,Socket.io Notification Trigger
,POST,/authority/applicants/:id/message,Initiate chat with a candidate.,Create Conversation record
AI Services,GET,/authority/ai/rank/:jobId,AI: Rank all applicants by suitability.,Batch Processing via Gemini
Analytics,GET,/authority/dashboard/stats,"View total views, clicks, and hire rate.",Aggregation (Match Rate/Stats)



<!-- Jobs -->

Category,Method,Endpoint,Description,Production Requirement
Public Feed,GET,/jobs,Global job feed with infinite scroll/pagination.,Cache (Redis) + Projection (Don't fetch applicants array)
,GET,/jobs/search,"Full-text search (Title, Role, Location).",MongoDB Atlas Search (Fuzzy Matching)
,GET,/jobs/filter,"Filter by jobType, minSalary, category.","Numeric Range Queries ($gte, $lte)"
Details,GET,/jobs/:id,Get full job description + Company details.,Increment views + Populate postedBy
,GET,/jobs/:id/similar,AI: Find jobs with similar skill requirements.,Vector Search / Category Matching
Creation,POST,/jobs,Create a new job post (via Authority).,Counter Schema for jobTrackingId
,PATCH,/jobs/:id,"Update job details (Title, Skills, Deadline).",Middleware: Only owner can edit
,PATCH,/jobs/:id/status,Manually Open/Close/Pause a job post.,Trigger: Notify all applicants
Analytics,GET,/jobs/:id/stats,"View application count, views, and match avg.",Aggregation Pipeline
Management,DELETE,/jobs/:id,Soft-delete/Archive a job post.,"Remove from ""Public"" index"


<!-- Applicants -->

Category,Method,Endpoint,Description,Production Requirement
Creation,POST,/applications/apply/:jobId,Create application + Trigger Counter Schema UID.,Middleware: Check isBlocked
,POST,/applications/ai-match/:id,AI: Manually trigger Gemini to re-calculate score.,Rate Limiting (API Costs)
Seeker View,GET,/applications/my-list,List all jobs applied for (Cards view).,Denormalized Metadata
,GET,/applications/:id/details,Detailed view of a single application status.,Populate jobId & companyId
,DELETE,/applications/:id/withdraw,Withdraw an application (Soft Delete).,Notify Employer via Socket
Employer View,GET,/applications/job/:jobId,List all candidates for a specific job.,Sort by matchPercentage
,GET,/applications/company/all,Global list of all applicants for the company.,Pagination (limit 20)
Workflow,PATCH,/applications/:id/status,Update status (Under Review -> Accepted).,Socket.io + Notification save
,PATCH,/applications/:id/notes,Employer-only internal notes on a candidate.,select: false for Seekers
Analytics,GET,/applications/stats/daily,Admin: Monitor application volume trends.,Aggregation (by Date)


<!-- Messages -->

Category,Method,Endpoint,Description,Production Requirement
Inbox,GET,/conversations,List all active chat threads for the logged-in user.,Sort by lastMessage.at
,GET,/conversations/:id,Fetch full message history for a specific thread.,Pagination (limit 50)
Creation,POST,/conversations/start,"Start a new chat (e.g., Employer contacts Seeker).",Check if Application exists
,POST,/messages/send,Send a new message (Text/File) to a conversationId.,Trigger Socket.io new_msg
Status,PATCH,/messages/:id/read,Mark a specific message as read.,Decrement unreadCount
,PATCH,/conversations/:id/read-all,Mark the entire thread as read.,Bulk Update + Socket Emit
Media,POST,/messages/upload,Upload an image or document to the chat.,Multer + Cloudinary/S3
AI Integration,GET,/messages/ai/summarize/:id,AI: Summarize a long conversation for the Admin.,Gemini API Summary
Management,DELETE,/messages/:id,"Soft-delete a message (Show ""Message Deleted"").",Audit Log entry


<!-- Conversation -->

Category,Method,Endpoint,Description,Production Requirement
Inbox,GET,/conversations,Get all active chat threads for the user.,Populate participants (exclude password)
Discovery,GET,/conversations/:id,Fetch metadata for a specific thread.,Check if User is a participant
Initialization,POST,/conversations/init,Create or find an existing chat between 2 users.,upsert logic: Prevent duplicate threads
Context,GET,/conversations/job/:jobId,Find the chat related to a specific job application.,"Unique index on [participants, jobId]"
Counters,PATCH,/conversations/:id/reset-unread,Set the user's unreadCount to 0.,"Trigger Socket.io ""Read"" status"
Management,PATCH,/conversations/:id/archive,Hide a conversation from the main inbox.,Soft-hide (don't delete history)
AI Summary,POST,/conversations/:id/ai-summary,AI: Generate a summary of the interview chat.,"Gemini API: ""Summarize last 20 msgs"""

<!-- Notification -->

Category,Method,Endpoint,Description,Production Requirement
Feed,GET,/notifications,Fetch all notifications for the logged-in user.,Pagination (limit 15) + Indexing
Counters,GET,/notifications/unread-count,Get the number of unread alerts for the header badge.,High-speed indexed count
Status,PATCH,/notifications/:id/read,Mark a single notification as read.,Trigger Socket.io badge sync
,PATCH,/notifications/read-all,Mark all notifications for the user as read.,Bulk updateMany operation
Governance,POST,/notifications/broadcast,Admin: Send a system-wide announcement.,Restrict to SuperAdmin only
Preferences,PATCH,/notifications/settings,Toggle email vs. in-app alerts for different events.,User Preference Schema link
Cleanup,DELETE,/notifications/:id,Remove a notification from the feed.,Soft-delete or Permanent delete

<!-- Counter -->

Category,Method,Endpoint,Description,Why you need this in Real Life?
Audit,GET,/admin/counters,"View all active sequences (e.g., GOO-FFW-SEQ).",To monitor how many applications a company has.
Correction,PATCH,/admin/counters/:id/reset,Manually set a sequence back to 0 or a specific number.,"If a ""Test"" company was deleted and you want to reuse IDs."
Initialization,POST,/admin/counters/seed,Pre-create counters for high-priority Enterprise clients.,"To ensure their IDs start from a specific range (e.g., 1000)."
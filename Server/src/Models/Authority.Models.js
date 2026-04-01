import mongoose from "mongoose";

const AuthoritySchema = new mongoose.Schema({
  // --- ORIGINAL CORE IDENTITY ---
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  companyLogo: {
    type: String,
    default: "https://via.placeholder.com/150"
  },
  companyWebsite: {
    type: String,
    required: true
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+']
  },
  industry: {
    type: String,
    index: true
  },
  location: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  about: {
    type: String
  },

  // --- ORIGINAL PREFERENCES & TRACKING ---
  preferredSkills: {
    type: [String]
  },
  preferredExperience: {
    type: Number,
    default: 0
  },
  jobTypesOffered: {
    type: [String],
    enum: ['Office', 'Home', 'Remote']
  },
  jobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
 // Inside your AuthoritySchema
rejectedSeekers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Applicant' // Points to the Application transaction
}],
SeekersToReview: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Applicant' 
}],
shortlistedSeekers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Applicant' 
}],
hiredSeekers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Applicant' 
}],

  // --- NEW: ENHANCED SOCIAL LINKS (Array of Objects) ---
  socialLinks: [{
    platform: { type: String, required: true }, // e.g. "LinkedIn"
    link: { type: String, required: true }      // e.g. "https://..."
  }],

  // --- NEW: EMPLOYER DASHBOARD & UI/UX ---
  dashboardStats: {
    totalProfileViews: { type: Number, default: 0 },
    totalJobClicks: { type: Number, default: 0 },
    activeJobsCount: { type: Number, default: 0 } 
  },
  branding: {
    coverImage: { type: String, default: "" },
    primaryColor: { type: String, default: "#2563eb" }, // Default Brand Blue
    tagline: { type: String, maxLength: 100 }
  },

  // --- NEW: ADMIN GOVERNANCE & SECURITY ---
  verificationStatus: {
    type: String,
    enum: ["Pending", "Verified", "Rejected", "Under Review"],
    default: "Pending",
    index: true
  },
  adminNotes: {
    type: String,
    select: false // Hidden from Employer, visible to Admin
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100 
  },
  isBlocked: {
    type: Boolean,
    default: false // Instant "Kill Switch" for Admin
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Optimized Indexing for the Search & Dashboard
AuthoritySchema.index({ companyName: 'text', industry: 1 });
AuthoritySchema.index({ verificationStatus: 1, isBlocked: 1 });

const Authority = mongoose.models.Authority || mongoose.model("Authority", AuthoritySchema);
export default Authority;
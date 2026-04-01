import mongoose from "mongoose";

const ApplicantSchema = new mongoose.Schema({
    // --- CORE RELATIONS ---
    seekerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seeker',
        required: true,
        index: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Authority',
        required: true,
        index: true
    },

    // --- CUSTOM TRACKING IDS (Human Readable) ---
    // Format: ABC-FFW-001
    applicationTrackingId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    // Format: ABC-FFW-01 (Job Serial for that specific company)
    jobTrackingId: {
        type: String,
        required: true
    },

    // --- SNAPSHOT DATA (For Instant Dashboard Cards) ---
    // We store these directly so the "Application Card" doesn't need to 'Populate' the Job model
    jobMetadata: {
        title: String,
        category: String, // e.g. "IT", "Marketing"
        salaryRange: String,
        location: String,
        jobRole: String
    },
    
    seekerMetadata: {
        name: String, // Concatenated FirstName + LastName
        experience: Number,
        profilePicture: String,
        topSkills: [String]
    },

    // --- AI & MATCHING LOGIC ---
    matchPercentage: {
        type: Number,
        default: 0, // Calculated via Gemini API comparing Seeker Skills vs Job Requirements
        min: 0,
        max: 100
    },
    aiInsights: {
        type: String, // Quick AI summary: "Highly skilled in React, lacks Docker experience."
    },

    // --- WORKFLOW & ACTIONS ---
    coverLetter: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Under Review', 'Shortlisted', 'Accepted', 'Rejected'],
        default: 'Under Review',
        index: true
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
    
    // Admin/Audit: Track who moved the status
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, { timestamps: true });

// Compound Index: Ensure a Seeker cannot apply for the same Job twice
ApplicantSchema.index({ seekerId: 1, jobId: 1 }, { unique: true });

const Applicant = mongoose.models.Applicant || mongoose.model("Applicant", ApplicantSchema);

export default Applicant;
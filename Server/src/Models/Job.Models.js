import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        index: true // Performance: Essential for search queries
    }, 
    description: {
        type: String,
        required: true
    },
    skillsRequired: {
        type: [String],
        required: true,
        index: true // Performance: For "Jobs matching my skills"
    },
    // Management: Adding numeric experience for better filtering logic
    experienceRequired: {
        type: String, 
        required: true
    },
    minExperience: { 
        type: Number, 
        default: 0 
    }, 
    jobType: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Internship', 'Remote', 'Contract', 'Hybrid'],
        required: true,
        index: true
    },
    jobRole: {
        type: String,
        required: true, 
    },
    salaryRange: {
        type: String 
    },
    // Production Logic: Numeric salary for range-based filtering
    minSalary: { type: Number, default: 0 },
    maxSalary: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },

    location: {
        type: String,
        required: true,
        index: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Changed to User for consistency with your architecture
        required: true,
        index: true
    },
    // Efficiency: It's better to store just the IDs. 
    // In a massive app, we'd use a separate Application collection to avoid Document Size Limits.
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], 
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], 
    status: {
        type: String,
        enum: ['Open', 'Closed', 'Paused', 'Draft', 'Flagged'], // Management: Added Draft/Flagged for Admin/Employer control
        default: 'Open',
        index: true
    },
    deadline: {
        type: Date
    },
    totalSeats: {
        type: Number,
        default: 1,
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },

    // --- NEW PRODUCTION & ADMIN FIELDS ---

    views: {
        type: Number,
        default: 0 // Analytics: Track job popularity
    },

    applicationCount: {
        type: Number,
        default: 0 // Performance: Denormalized field to avoid .length on large arrays
    },

    isFeatured: {
        type: Boolean,
        default: false // Admin/Revenue: Allow specific jobs to be pinned at the top
    },

    isVerified: {
        type: Boolean,
        default: true // Admin: Set to false if the posting company isn't verified yet
    },

    aiSummary: {
        type: String // AI: Store a 2-sentence AI-generated summary for quick mobile viewing
    },

    tags: [String] // Search: For better "Related Jobs" suggestions
}, 
{ 
    timestamps: true // Replaces manual createdAt
});

// Performance: Compound Index for the main "Search" page
// This makes queries like "Full-time SDE roles in Bangalore" hit an index instead of a full scan.
JobSchema.index({ title: 'text', description: 'text' }); // Full-text search support
JobSchema.index({ status: 1, category: 1, createdAt: -1 });

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

export default Job;
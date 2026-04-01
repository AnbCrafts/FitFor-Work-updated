import mongoose from "mongoose";

const SeekerSchema = new mongoose.Schema(
    { 
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true // Performance: Essential for profile lookups
          },
        // Management: Adding 'limit' logic in your controllers for these arrays is advised
        appliedFor: [{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
          }],
        savedJobs: [{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
          }],
        offeredJobs: [{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
          }],
        rejectedApplications: [{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
          }],
        
        desiredPost: {
            type: String,
            required: true,
            trim: true,
            index: true // Performance: For "Employers searching for X role"
        },
        status:{
            type:String,
            default:"Fresher",
            enum:["Fresher","Experienced"],
            required:true
        },
        skills: {
            type: [String],
            required: true,
            validate: {
                validator: function (arr) {
                    return arr.length > 0;
                },
                message: "At least one skill is required"
            },
            index: true // Performance: Crucial for "Match jobs by skill" queries
        },
        experience:{
            type:Number,
            default:0,
        },
        qualifications:{
            type:String,
            required:true,
        },
        resume:{
            type:String, // URL to S3/Cloudinary
        },

        // --- NEW PRODUCTION & AI FIELDS ---

        resumeContentText: {
            type: String,
            select: false // AI: Raw text extracted from PDF for Gemini to analyze without re-downloading the file
        },

        isLookingForJob: {
            type: Boolean,
            default: true, // UX: Let's seekers "turn off" their profile without deleting it
        },

        preferredLocation:{
            type:String,
            required:true,
        },
        preferredJobType:{
            type:String,
            required:true,
            default:"Office",
            enum:["Office","Home","Remote"]
        },
        availableFrom:{
            type:Date,
            default: Date.now, // Fixed: Use reference, not immediate call
        },
        currentCompany:{
            type:String,
            default:"None",
        },
        currentPost:{
            type:String,
            default:"None"
        },
        currentCTC:{
            type:Number,
            default:0
        },
        expectedCTC:{
            type:Number,
            default:0
        },
        portfolioLink:{
            type:String,
            validate: {
                validator: (v) => v === "" || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v),
                message: "Please enter a valid URL"
            }
        },
        certifications: [{
            name: String,
            issuer: String,
            issueDate: Date,
            link: String // UX: Better than a simple string array for professional display
        }],
        languagesKnown:{
            type:[String],
            required:true,
        },
        achievements:{
            type:[String],
        },

        // Management: Track profile completion %
        profileCompletionScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    }, 
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Performance: Compound Index for Job Matching
// Helps finding candidates based on Skills + Location + Experience quickly
SeekerSchema.index({ skills: 1, preferredLocation: 1, experience: -1 });

const Seeker = mongoose.models.Seeker || mongoose.model("Seeker", SeekerSchema);

export default Seeker;
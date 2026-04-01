import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String, 
            required: true,
            unique: true,
            trim: true, // Performance: Removes accidental whitespace
            index: true, // Performance: Speeds up profile lookups
        }, 
        firstName: {
            type: String,
            required: true,
            trim: true,
        }, 
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, // Management: Prevents "User@Me.com" vs "user@me.com" duplicates
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            index: true,
        }, 
        picture: { 
            type: String,
            default: "https://via.placeholder.com/150", // Management: Better UX than an empty string
            required: true, 
        },
        address: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            select: false, // Security: Automatically excludes password from "find" queries
        },  
        status: {
            type: String,
            default: "Active",
            enum: ["Active", "Inactive", "Blocked"],
        },
        role: {
            type: String,
            default: "Seeker",
            enum: ["Seeker", "Authority", "Admin"],
            required: true 
        },
        
        // --- NEW PRODUCTION-GRADE FIELDS ---

        isEmailVerified: {
            type: Boolean,
            default: false, // Management: Critical for preventing spam accounts
        },
        
        refreshToken: {
            type: String,
            select: false, // Security: Store hashed refresh tokens for "Stay logged in" feature
        },

        lastLogin: {
            type: Date, // Admin: Track active vs dormant users
        },

        otp: {
            code: String,
            expiresAt: Date, // Management: For Email/Phone verification & Password Resets
        },

        bio: {
            type: String,
            maxLength: 500, // UI/UX: Quick summary for the Seeker/Employer profile
        },

        accountVerifiedByAdmin: {
            type: Boolean,
            default: false, // Admin: "Authority" roles should be verified before posting jobs
        },
        
        socialLinks: {
            linkedin: String,
            github: String,
            website: String, // UI/UX: Essential for professional platforms
        }
    }, 
    { 
        timestamps: true,
        toJSON: { virtuals: true }, // Performance: Allows for derived fields without storing them
        toObject: { virtuals: true }
    }
);

// Performance: Compound index for search (Role + Status)
// This makes it 10x faster for Admin to filter "All Blocked Employers"
UserSchema.index({ role: 1, status: 1 });
// Add this at the bottom of your User.js, before the export

// 1. Virtual for Notifications
UserSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'recipientId'
});

// 2. Virtual for Conversations (Inbox)
UserSchema.virtual('conversations', {
  ref: 'Conversation',
  localField: '_id',
  foreignField: 'participants'
});

// 3. Virtual for Applications (If they are a Seeker)
UserSchema.virtual('myApplications', {
  ref: 'Applicant',
  localField: '_id',
  foreignField: 'seekerId'
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
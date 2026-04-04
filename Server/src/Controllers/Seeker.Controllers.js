import validator from 'validator';
import Seeker from '../Models/Seeker.Models.js';
import User from "../Models/User.Models.js";
import Notification from "../Models/Notification.Models.js";
import { uploadOnCloudinary } from '../Utils/CloudConfig.Utils.js';
import fs from 'fs'
import Job from '../Models/Job.Models.js';
import Authority from '../Models/Authority.Models.js';
import mongoose from "mongoose";


const createProfile = async (req, res) => {
    // Helper to handle both JSON arrays and form-data strings
    const toArray = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        return value.split(",").map(v => v.trim());
    };

    const resumePath = req.file?.path;

    try {
        const {
            desiredPost,
            status,
            skills,
            experience,
            qualifications,
            preferredLocation,
            preferredJobType,
            availableFrom,
            currentCompany,
            currentPost,
            currentCTC,
            expectedCTC,
            portfolioLink,
            certifications,
            languagesKnown,
            achievements
        } = req.body;

        // 1. Security: Use req.user._id from verifyJWT instead of req.body
        const userId = req.user._id;

        // 2. Prevent Duplicates: Check if seeker profile already exists
        const existingProfile = await Seeker.findOne({ userId });
        if (existingProfile) {
            if (resumePath) fs.unlinkSync(resumePath);
            return res.status(409).json({ 
                success: false, 
                message: "Seeker profile already exists for this account. Use update instead." 
            });
        }

        // 3. Mandatory Field Check
        if (!desiredPost || !status || !skills || !qualifications || !preferredLocation) {
            if (resumePath) fs.unlinkSync(resumePath);
            return res.status(400).json({ success: false, message: "Missing required profile fields." });
        }

        // 4. Resume Upload logic
        let uploadedResume = null;
        if (resumePath) {
            uploadedResume = await uploadOnCloudinary(resumePath);
            if (!uploadedResume) {
                return res.status(500).json({ success: false, message: "Failed to upload resume." });
            }
            fs.unlinkSync(resumePath); // Clean up local file
        }

        // 5. Create Seeker Document
        const newSeeker = await Seeker.create({
            userId,
            desiredPost,
            status,
            skills: toArray(skills),
            experience: Number(experience) || 0,
            qualifications,
            resume: uploadedResume?.secure_url || "",
            preferredLocation,
            preferredJobType,
            availableFrom,
            currentCompany,
            currentPost,
            currentCTC: Number(currentCTC) || 0,
            expectedCTC: Number(expectedCTC) || 0,
            portfolioLink,
            certifications: toArray(certifications),
            languagesKnown: toArray(languagesKnown),
            achievements: toArray(achievements),
        });

        // 6. Link Seeker to User Document (Critical for Populate)
        await User.findByIdAndUpdate(userId, { seekerProfile: newSeeker._id });

        return res.status(201).json({ 
            success: true, 
            message: "Professional profile initialized successfully", 
            seeker: newSeeker 
        });

    } catch (error) {
        if (resumePath && fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
        console.error("Create Profile Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error during profile creation" });
    }
};
const getAllSeekers = async (req, res) => {
    try {
        // 1. Extract Query Parameters
        // Usage: /api/seeker?page=1&limit=10&skills=React,Node&location=Delhi&search=Developer
        let { 
            page = 1, 
            limit = 10, 
            skills, 
            location, 
            search, 
            minCTC, 
            maxCTC 
        } = req.query;

        // Convert types
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        // 2. Build Dynamic Query Object
        const query = {};

        // Filter by Skills (Matches if seeker has ANY of the provided skills)
        if (skills) {
            const skillArray = skills.split(",").map(s => s.trim());
            query.skills = { $in: skillArray.map(s => new RegExp(s, "i")) };
        }

        // Filter by Location (Case-insensitive)
        if (location) {
            query.preferredLocation = { $regex: location, $options: "i" };
        }

        // Fuzzy Search by Post/Title
        if (search) {
            query.desiredPost = { $regex: search, $options: "i" };
        }

        // Filter by Expected CTC Range
        if (minCTC || maxCTC) {
            query.expectedCTC = {};
            if (minCTC) query.expectedCTC.$gte = Number(minCTC);
            if (maxCTC) query.expectedCTC.$lte = Number(maxCTC);
        }

        // 3. Execute Query with Population
        // We populate 'userId' to get the Name and Picture from the User collection
        const seekers = await Seeker.find(query)
            .populate("userId", "firstName lastName email picture phone")
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(limit)
            .lean();

        // 4. Get Total Count for Frontend Pagination
        const totalSeekers = await Seeker.countDocuments(query);

        if (!seekers || seekers.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No seekers found matching the criteria" 
            });
        }

        // 5. Response with MetaData
        return res.status(200).json({
            success: true,
            message: "Seekers retrieved successfully",
            pagination: {
                totalSeekers,
                currentPage: page,
                totalPages: Math.ceil(totalSeekers / limit),
                pageSize: seekers.length
            },
            seekers
        });

    } catch (error) {
        console.error("GetAllSeekers Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};
const getSeekerById = async (req, res) => {
    try {
        const { seekerId } = req.params;

        // 1. Validation: Check if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(seekerId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Seeker ID format" 
            });
        }

        // 2. Fetch Seeker and Populate User Details
        // We use .populate to "join" the associated User data (name, email, picture)
        const seeker = await Seeker.findById(seekerId)
            .populate("userId", "firstName lastName email phone picture address")
            .lean(); // Faster performance for read-only operations

        if (!seeker) {
            return res.status(404).json({ 
                success: false, 
                message: "No seeker profile found with this ID" 
            });
        }

        // 3. Response
        return res.status(200).json({
            success: true,
            message: "Seeker profile retrieved successfully",
            seeker
        });

    } catch (error) {
        console.error(`GetSeekerById Error for ID ${req.params.seekerId}:`, error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};
const getSeekerByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Validation: Valid MongoDB ID?
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid User ID format" 
            });
        }

        // 2. Security: Authorization Check
        // If the requester is NOT an Admin AND is not the owner of the ID, block access.
        if (req.user.role !== "Admin" && req.user._id.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized: You can only view your own professional profile." 
            });
        }

        // 3. Fetch and Populate
        // We populate the User object to get Name, Email, etc.
        const seeker = await Seeker.findOne({ userId })
            .populate("userId", "firstName lastName email phone picture bio address")
            .lean();

        if (!seeker) {
            return res.status(404).json({ 
                success: false, 
                message: "Professional profile not found for this user." 
            });
        }

        // 4. Response
        return res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            seeker
        });

    } catch (error) {
        console.error(`GetSeekerByUserId Error:`, error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};
const removeSeeker = async (req, res) => {
    // 1. Start a Session for the Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { seekerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(seekerId)) {
            return res.status(400).json({ success: false, message: "Invalid Seeker ID" });
        }

        // 2. Find the Seeker first to get the associated userId
        const seeker = await Seeker.findById(seekerId).session(session);
        if (!seeker) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Seeker profile not found" });
        }

        const userId = seeker.userId;

        // 3. Delete the Seeker Profile (Permanent removal as requested)
        await Seeker.findByIdAndDelete(seekerId).session(session);

        // 4. Soft Delete the User (Change status to "Blocked")
        // We also clear the seekerProfile reference and the refreshToken
        await User.findByIdAndUpdate(
            userId,
            { 
                $set: { status: "Blocked" },
                $unset: { seekerProfile: 1, refreshToken: 1 } 
            },
            { session }
        );

        // 5. Commit all changes
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ 
            success: true, 
            message: "Seeker profile removed and associated user has been blocked." 
        });

    } catch (error) {
        // 6. If anything fails, undo all database changes
        await session.abortTransaction();
        session.endSession();
        
        console.error("Remove Seeker Transaction Error:", error);
        return res.status(500).json({ success: false, message: "Failed to process removal" });
    }
};

const getAllFactors = async (req, res) => {
    try {
        // 1. Use Aggregation Pipeline for maximum speed
        const factors = await Seeker.aggregate([
            {
                $facet: {
                    "skills": [ { $unwind: "$skills" }, { $group: { _id: "$skills" } } ],
                    "certifications": [ { $unwind: "$certifications" }, { $group: { _id: "$certifications" } } ],
                    "languagesKnown": [ { $unwind: "$languagesKnown" }, { $group: { _id: "$languagesKnown" } } ],
                    "locations": [ { $group: { _id: "$preferredLocation" } } ],
                    "posts": [ { $group: { _id: "$desiredPost" } } ],
                    "qualifications": [ { $group: { _id: "$qualifications" } } ],
                    "jobTypes": [ { $group: { _id: "$preferredJobType" } } ],
                    "statusList": [ { $group: { _id: "$status" } } ]
                }
            },
            {
                $project: {
                    skills: { $map: { input: "$skills", as: "s", in: "$$s._id" } },
                    certifications: { $map: { input: "$certifications", as: "c", in: "$$c._id" } },
                    languagesKnown: { $map: { input: "$languagesKnown", as: "l", in: "$$l._id" } },
                    preferredLocation: { $map: { input: "$locations", as: "loc", in: "$$loc._id" } },
                    desiredPost: { $map: { input: "$posts", as: "p", in: "$$p._id" } },
                    qualifications: { $map: { input: "$qualifications", as: "q", in: "$$q._id" } },
                    preferredJobType: { $map: { input: "$jobTypes", as: "j", in: "$$j._id" } },
                    status: { $map: { input: "$statusList", as: "st", in: "$$st._id" } }
                }
            }
        ]);

        // 2. Format the response
        // Since $facet returns an array with one object, we grab index 0
        const result = factors[0];

        return res.status(200).json({
            success: true,
            message: "Unique filter factors retrieved successfully",
            allFactors: result
        });

    } catch (error) {
        console.error("❌ Aggregation Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
const getCustomSeekers = async (req, res) => {
  try {
    const {
      skills,
      certifications,
      languagesKnown,
      minExp, // Changed from exact 'experiences'
      maxExp,
      availability,
      status,
      desiredPost,
      qualifications,
      preferredLocation,
      preferredJobType,
      minCTC, // Changed from exact 'expectedCTC'
      maxCTC,
      page = 1,
      limit = 10
    } = req.query;

    let filterQuery = {};

    // 1. Array/List Filters (Case-insensitive Partial Match)
    const applyArrayFilter = (field, value) => {
      if (value) {
        const values = Array.isArray(value) ? value : value.split(",");
        // Matches if the array contains ANY of these values (case-insensitive)
        filterQuery[field] = { 
          $in: values.map(v => new RegExp(v.trim(), "i")) 
        };
      }
    };

    applyArrayFilter("skills", skills);
    applyArrayFilter("certifications", certifications);
    applyArrayFilter("languagesKnown", languagesKnown);

    // 2. Numeric Range Filters (Experience & CTC)
    if (minExp || maxExp) {
      filterQuery.experience = {};
      if (minExp) filterQuery.experience.$gte = Number(minExp);
      if (maxExp) filterQuery.experience.$lte = Number(maxExp);
    }

    if (minCTC || maxCTC) {
      filterQuery.expectedCTC = {};
      if (minCTC) filterQuery.expectedCTC.$gte = Number(minCTC);
      if (maxCTC) filterQuery.expectedCTC.$lte = Number(maxCTC);
    }

    // 3. Availability (Fetch everyone available ON or AFTER this date)
    if (availability) {
      filterQuery.availableFrom = { $lte: new Date(availability) };
    }

    // 4. Case-insensitive Partial String Matches (Fuzzy Search)
    const applyFuzzyFilter = (field, value) => {
      if (value) {
        filterQuery[field] = { $regex: value, $options: 'i' };
      }
    };

    applyFuzzyFilter("status", status);
    applyFuzzyFilter("desiredPost", desiredPost);
    applyFuzzyFilter("qualifications", qualifications);
    applyFuzzyFilter("preferredLocation", preferredLocation);
    applyFuzzyFilter("preferredJobType", preferredJobType);

    // 5. Execute with Pagination & Population
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const seekers = await Seeker.find(filterQuery)
      .populate("userId", "firstName lastName email picture") // Join user data
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Seeker.countDocuments(filterQuery);

    return res.status(200).json({
      success: true,
      count: seekers.length,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      seekers
    });

  } catch (error) {
    console.error("❌ Error in getCustomSeekers:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getMatchingJobs = async (req, res) => {
  try {
    const { seekerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Fetch Seeker Skills
    const seeker = await Seeker.findById(seekerId).select("skills experience expectedCTC");
    if (!seeker) {
        return res.status(404).json({ success: false, message: "Seeker not found" });
    }

    const seekerSkills = seeker.skills || [];
    if (seekerSkills.length === 0) {
        return res.status(400).json({ success: false, message: "Add skills to your profile to see matches" });
    }

    // 2. Aggregation Pipeline for Smart Matching
    const jobs = await Job.aggregate([
      {
        // Filter jobs that have AT LEAST one matching skill
        $match: {
          skillsRequired: { $in: seekerSkills },
          status: "Active" // Ensure we don't recommend closed jobs
        }
      },
      {
        // Add a "matchCount" field based on how many skills intersect
        $addFields: {
          matchCount: {
            $size: { $setIntersection: ["$skillsRequired", seekerSkills] }
          }
        }
      },
      {
        // Optional: Smart filtering by Experience
        // Boost jobs where seeker's exp is within the required range
        $addFields: {
          isExpMatch: { 
            $cond: { 
                if: { $lte: ["$experienceRequired", seeker.experience] }, 
                then: 2, 
                else: 0 
            } 
          }
        }
      },
      {
        // Calculate Total Score (Skills weight + Experience weight)
        $addFields: {
          totalScore: { $add: ["$matchCount", "$isExpMatch"] }
        }
      },
      { $sort: { totalScore: -1, createdAt: -1 } }, // Best matches + Newest first
      { $skip: skip },
      { $limit: limit },
      {
        // Join with Company Data
        $lookup: {
          from: "companies", // Adjust to your actual company collection name
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetails"
        }
      },
      { $unwind: "$companyDetails" },
      {
        // Clean up output
        $project: {
          title: 1,
          location: 1,
          salary: 1,
          skillsRequired: 1,
          matchCount: 1,
          totalScore: 1,
          "companyDetails.companyName": 1,
          "companyDetails.companyLogo": 1
        }
      }
    ]);

    // 3. Get total for pagination
    const totalMatches = await Job.countDocuments({
      skillsRequired: { $in: seekerSkills },
      status: "Active"
    });

    return res.status(200).json({
      success: true,
      message: "Personalized matching jobs found",
      pagination: {
        totalMatches,
        currentPage: page,
        totalPages: Math.ceil(totalMatches / limit)
      },
      jobs
    });

  } catch (error) {
    console.error("Match Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getWantedAuthorities = async (req, res) => {
  try {
    const { seekerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!seekerId) {
      return res.status(400).json({ success: false, message: "Seeker ID is required" });
    }

    const seeker = await Seeker.findById(seekerId);
    if (!seeker) {
      return res.status(404).json({ success: false, message: "Seeker not found" });
    }

    const seekerSkills = (seeker.skills || [])
      .map(skill => skill && skill.trim())
      .filter(skill => skill); // removes empty or undefined

    if (seekerSkills.length === 0) {
      return res.status(404).json({ success: false, message: "No skills found for this seeker" });
    }

    const totalMatches = await Authority.countDocuments({
      preferredSkills: { $in: seekerSkills }
    });

   const matchingAuthorities = await Authority.find({
  preferredSkills: { $in: seekerSkills }
})
  .select('_id companyName companyEmail companyLogo companyWebsite companySize industry location contactNumber about preferredSkills preferredExperience jobTypesOffered jobs')
  .skip(skip)
  .limit(limit);


    return res.status(200).json({
      success: true,
      message: "Matching authorities fetched successfully",
      totalMatches,
      currentPage: page,
      totalPages: Math.ceil(totalMatches / limit),
      authorities: matchingAuthorities,
    });

  } catch (error) {
    console.error("Error in getWantedAuthorities:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}; // not functional

const editProfile = async(req,res)=>{
  try {
    const {seekerId} = req.params;
    const updates = req.body;
    if (!seekerId) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }
    const seeker = await Seeker.findById(seekerId);
    if (!seeker) {
      return res.status(404).json({ success: false, message: "Seeker not found" });
    }
    const updatedSeeker= await Seeker.findByIdAndUpdate(seekerId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedSeeker) {
      return res.status(404).json({ success: false, message: "Seeker not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      authority: updatedSeeker,
    });

    
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
const getUserDashboardData = async (req, res) => {
  try {
    const { seekerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(seekerId)) {
        return res.status(400).json({ success: false, message: "Invalid Seeker ID" });
    }

    // 1. Fetch Seeker and basic stats in ONE lean call
    // We only populate essential info for the dashboard view
    const seeker = await Seeker.findById(seekerId)
      .select("skills desiredPost expectedCTC qualifications preferredLocation preferredJobType status appliedFor savedJobs rejectedApplications offeredJobs")
      .populate({
          path: "appliedFor",
          options: { limit: 5, sort: { createdAt: -1 } }, // Only get recent 5 for dashboard
          select: "title location salaryRange companyId"
      })
      .lean();

    if (!seeker) {
      return res.status(404).json({ success: false, message: "Seeker not found" });
    }

    // 2. Build Intelligent Recommendation Query
    // We use $or instead of a strict $and to ensure the dashboard isn't EMPTY 
    // if the user has very specific preferences.
    const recommendationCriteria = [
        { skillsRequired: { $in: seeker.skills || [] } },
        { title: { $regex: seeker.desiredPost || "", $options: "i" } },
        { location: { $regex: seeker.preferredLocation || "", $options: "i" } }
    ];

    const recommendedJobs = await Job.find({
        $or: recommendationCriteria,
        status: "Active",
        _id: { $nin: seeker.appliedFor.map(job => job._id) } // Don't recommend jobs already applied to
    })
    .limit(10) // Dashboard only needs a "Sneak Peek"
    .select("title companyId location salaryRange jobType createdAt")
    .populate("companyId", "companyName companyLogo")
    .sort({ createdAt: -1 })
    .lean();

    // 3. Construct Analytics Summary
    const stats = {
        totalApplied: seeker.appliedFor?.length || 0,
        totalSaved: seeker.savedJobs?.length || 0,
        totalRejected: seeker.rejectedApplications?.length || 0,
        totalOffered: seeker.offeredJobs?.length || 0,
        profileCompleteness: calculateProfileScore(seeker) // Optional helper function
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved",
      dashboard: {
        stats,
        recentApplications: seeker.appliedFor,
        recommendedJobs,
        preferences: {
            post: seeker.desiredPost,
            location: seeker.preferredLocation,
            expectedCTC: seeker.expectedCTC
        }
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Helper to encourage user to fill profile
function calculateProfileScore(seeker) {
    let score = 0;
    if (seeker.skills?.length > 3) score += 40;
    if (seeker.resume) score += 30;
    if (seeker.experience > 0) score += 30;
    return score;
}

const toggleSaveJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ success: false, message: "Invalid Job ID" });
        }

        // 1. Find the seeker profile associated with this user
        const seeker = await Seeker.findOne({ userId });
        if (!seeker) {
            return res.status(404).json({ success: false, message: "Seeker profile not found" });
        }

        // 2. Check if job is already saved
        const isSaved = seeker.savedJobs.includes(jobId);

        // 3. Toggle Logic
        const update = isSaved 
            ? { $pull: { savedJobs: jobId } } 
            : { $addToSet: { savedJobs: jobId } };

        await Seeker.findByIdAndUpdate(seeker._id, update);

        return res.status(200).json({
            success: true,
            message: isSaved ? "Job removed from saved list" : "Job saved successfully",
            isSaved: !isSaved
        });

    } catch (error) {
        console.error("Toggle Save Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const getAppliedApplications = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Find the seeker and populate the 'appliedFor' list
        // Note: This assumes 'appliedFor' stores Application IDs (recommended)
        // or Job IDs with a secondary lookup.
        const seeker = await Seeker.findOne({ userId })
            .populate({
                path: 'appliedFor',
                populate: {
                    path: 'jobId',
                    select: 'title location salaryRange companyId',
                    populate: { path: 'companyId', select: 'companyName companyLogo' }
                }
            })
            .lean();

        if (!seeker) {
            return res.status(404).json({ success: false, message: "Seeker not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Applied applications fetched",
            applications: seeker.appliedFor || []
        });

    } catch (error) {
        console.error("Get Applications Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const updateResume = async (req, res) => {
    const localFilePath = req.file?.path;

    if (!localFilePath) {
        return res.status(400).json({ success: false, message: "No resume file provided" });
    }

    try {
        const uploadedResume = await uploadOnCloudinary(localFilePath);
        
        if (!uploadedResume) {
            return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
        }

        const seeker = await Seeker.findOneAndUpdate(
            { userId: req.user._id },
            { $set: { resume: uploadedResume.secure_url } },
            { new: true }
        );

        // Cleanup local file
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

        return res.status(200).json({
            success: true,
            message: "Resume updated successfully",
            resumeUrl: seeker.resume
        });

    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return res.status(500).json({ success: false, message: "Resume update failed" });
    }
};

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import axios from "axios";
// import pdf from "pdf-parse";

// const analyzeResumeAI = async (req, res) => {
//     try {
//         const seeker = await Seeker.findOne({ userId: req.user._id });
//         if (!seeker || !seeker.resume) {
//             return res.status(404).json({ success: false, message: "Resume not found. Please upload one first." });
//         }

//         // 1. Download Resume from Cloudinary
//         const response = await axios.get(seeker.resume, { responseType: 'arraybuffer' });
//         const data = await pdf(response.data);
//         const resumeText = data.text;

//         // 2. Initialize Gemini
//         const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//         const prompt = `
//             Analyze the following resume text and return a JSON object with:
//             1. 'topSkills': Array of top 5 professional skills found.
//             2. 'suggestedRoles': Top 3 job titles this person is fit for.
//             3. 'improvements': 2 brief tips to improve this resume for ATS.
//             Resume Text: ${resumeText.substring(0, 5000)}
//         `;

//         const result = await model.generateContent(prompt);
//         const aiResponse = JSON.parse(result.response.text().replace(/```json|```/g, ""));

//         return res.status(200).json({
//             success: true,
//             analysis: aiResponse
//         });

//     } catch (error) {
//         console.error("AI Analysis Error:", error);
//         return res.status(500).json({ success: false, message: "AI Analysis failed" });
//     }
// };

const getApplicationDetails = async (req, res) => {
    try {
        const { id } = req.params; // This is the Application ID

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Application ID" });
        }

        // 1. Fetch specific application and deep populate
        const application = await Application.findById(id)
            .populate({
                path: 'jobId',
                select: 'title location salaryRange description skillsRequired companyId',
                populate: { path: 'companyId', select: 'companyName companyLogo companyWebsite' }
            })
            .lean();

        if (!application) {
            return res.status(404).json({ success: false, message: "Application details not found" });
        }

        // 2. Security: Ensure this application belongs to the logged-in seeker
        // (Assuming you have a seekerId field in your Application model)
        // if (application.seekerId.toString() !== req.user.seekerProfile.toString()) {
        //     return res.status(403).json({ success: false, message: "Unauthorized access" });
        // }

        return res.status(200).json({
            success: true,
            message: "Detailed application tracking fetched",
            application
        });

    } catch (error) {
        console.error("Get Application Detail Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const getSavedJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const seeker = await Seeker.findOne({ userId: req.user._id })
            .populate({
                path: 'savedJobs',
                options: { skip, limit, sort: { createdAt: -1 } },
                populate: { path: 'companyId', select: 'companyName companyLogo' }
            })
            .lean();

        if (!seeker) {
            return res.status(404).json({ success: false, message: "Seeker not found" });
        }

        return res.status(200).json({
            success: true,
            count: seeker.savedJobs.length,
            savedJobs: seeker.savedJobs
        });

    } catch (error) {
        console.error("Get Saved Jobs Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};










export {editProfile, createProfile, getAllSeekers, getSeekerById, removeSeeker, getSeekerByUserId, getAllFactors,getCustomSeekers,getMatchingJobs,getWantedAuthorities,getUserDashboardData,toggleSaveJob,getAppliedApplications,updateResume,getApplicationDetails,getSavedJobs }
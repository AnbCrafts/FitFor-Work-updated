import Seeker from "../Models/Seeker.Models.js";
import User from "../Models/User.Models.js";
import Job from "../Models/Job.Models.js";
import Authority from "../Models/Authority.Models.js";
import Applicant from "../Models/Applicant.Models.js";
import { uploadOnCloudinary } from "../Utils/CloudConfig.Utils.js";
import fs from "fs";
import mongoose from "mongoose";

// 1. Create Profile (Implicit Identity from Cookie)
const createProfile = async (req, res) => {
    const toStringArray = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
        } catch (e) {
            return value.split(",").map(v => v.trim()).filter(v => v !== "");
        }
    };

    const toObjectArray = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map(item => typeof item === 'string' ? { name: item } : item);
            }
        } catch (e) {
            return value.split(",").map(v => ({ name: v.trim() }));
        }
    };

    const resumePath = req.file?.path;
    try {
        const {
            desiredPost, status, skills, experience, qualifications,
            preferredLocation, preferredJobType, availableFrom,
            currentCompany, currentPost, currentCTC, expectedCTC,
            portfolioLink, certifications, languagesKnown, achievements
        } = req.body;

        const userId = req.user._id;

        const existingProfile = await Seeker.findOne({ userId });
        if (existingProfile) {
            if (resumePath) fs.unlinkSync(resumePath);
            return res.status(409).json({ success: false, message: "Profile already exists." });
        }

        let uploadedResume = null;
        if (resumePath) {
            uploadedResume = await uploadOnCloudinary(resumePath);
            fs.unlinkSync(resumePath);
        }

        const newSeeker = await Seeker.create({
            userId,
            desiredPost,
            status,
            skills: toStringArray(skills),
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
            certifications: toObjectArray(certifications),
            languagesKnown: toStringArray(languagesKnown),
            achievements: toStringArray(achievements),
        });

        await User.findByIdAndUpdate(userId, { seekerProfile: newSeeker._id });

        return res.status(201).json({ success: true, seeker: newSeeker });
    } catch (error) {
        if (resumePath && fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Edit Profile (Uses resolved :id)
const editProfile = async (req, res) => {
    try {
        const { id } = req.params; // resolveIdentity swapped "me" for real Seeker ID
        const updates = req.body;

        const updatedSeeker = await Seeker.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedSeeker) return res.status(404).json({ success: false, message: "Seeker not found" });
        return res.status(200).json({ success: true, seeker: updatedSeeker });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Update Resume (Implicit Identity)
const updateResume = async (req, res) => {
    const resumePath = req.file?.path;
    try {
        const seekerId = req.user.seekerProfile;
        if (!resumePath) return res.status(400).json({ success: false, message: "No file provided" });

        const uploaded = await uploadOnCloudinary(resumePath);
        fs.unlinkSync(resumePath);

        const seeker = await Seeker.findByIdAndUpdate(seekerId, { resume: uploaded.secure_url }, { new: true });
        return res.status(200).json({ success: true, resumeUrl: seeker.resume });
    } catch (error) {
        if (resumePath && fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Get Own Seeker Profile (Implicit Identity)
const getSeekerProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const seeker = await Seeker.findOne({ userId }).populate("userId", "-password");
        if (!seeker) return res.status(404).json({ success: false, message: "Profile not found" });
        return res.status(200).json({ success: true, seeker });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Get User Dashboard Data (Uses resolved :id)
const getUserDashboardData = async (req, res) => {
    try {
        const { id } = req.params;
        const seeker = await Seeker.findById(id).populate("appliedFor savedJobs");
        if (!seeker) return res.status(404).json({ success: false, message: "Seeker not found" });
        return res.status(200).json({ success: true, seeker });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Discovery: Get All Seekers
const getAllSeekers = async (req, res) => {
    try {
        const seekers = await Seeker.find({}).populate("userId", "firstName lastName email picture");
        return res.status(200).json({ success: true, seekers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Discovery: Get All Factors (For Filters)
const getAllFactors = async (req, res) => {
    try {
        const factors = await Seeker.aggregate([
            { $facet: {
                "skills": [{ $unwind: "$skills" }, { $group: { _id: "$skills" } }],
                "locations": [{ $group: { _id: "$preferredLocation" } }],
                "jobTypes": [{ $group: { _id: "$preferredJobType" } }]
            }}
        ]);
        return res.status(200).json({ success: true, factors: factors[0] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 8. Search: Get Customized Seekers
const getCustomSeekers = async (req, res) => {
    try {
        const { skills, location, jobType } = req.query;
        let filter = {};
        if (skills) filter.skills = { $in: skills.split(",") };
        if (location) filter.preferredLocation = location;
        if (jobType) filter.preferredJobType = jobType;

        const seekers = await Seeker.find(filter).populate("userId", "firstName lastName picture");
        return res.status(200).json({ success: true, seekers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 9. Get Seeker By ID (Public Details)
const getSeekerById = async (req, res) => {
    try {
        const { seekerId } = req.params;
        const seeker = await Seeker.findById(seekerId).populate("userId", "firstName lastName email phone picture bio address");
        if (!seeker) return res.status(404).json({ success: false, message: "Seeker not found" });
        return res.status(200).json({ success: true, seeker });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 10. Recommendations: Matching Jobs (Uses resolved :id)
const getMatchingJobs = async (req, res) => {
    try {
        const { id } = req.params;
        const seeker = await Seeker.findById(id);
        const jobs = await Job.find({ 
            skillsRequired: { $in: seeker.skills },
            status: "Active"
        }).populate("postedBy", "companyName companyLogo");
        return res.status(200).json({ success: true, jobs });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 11. Recommendations: Wanted Authorities (Uses resolved :id)
const getWantedAuthorities = async (req, res) => {
    try {
        const { id } = req.params;
        const seeker = await Seeker.findById(id);
        const authorities = await Authority.find({
            preferredSkills: { $in: seeker.skills }
        }).select("companyName companyLogo industry location");
        return res.status(200).json({ success: true, authorities });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 12. Interactions: Toggle Save Job (Implicit Identity)
const toggleSaveJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const seekerId = req.user.seekerProfile;

        const seeker = await Seeker.findById(seekerId);
        const index = seeker.savedJobs.indexOf(jobId);

        if (index === -1) {
            seeker.savedJobs.push(jobId);
            await seeker.save();
            return res.status(200).json({ success: true, message: "Job saved" });
        } else {
            seeker.savedJobs.splice(index, 1);
            await seeker.save();
            return res.status(200).json({ success: true, message: "Job unsaved" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 13. Interactions: Get Applied Applications (Implicit Identity)
const getAppliedApplications = async (req, res) => {
    try {
        const seekerId = req.user.seekerProfile;
        const applications = await Applicant.find({ seekerId }).populate("jobId companyId");
        return res.status(200).json({ success: true, applications });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 14. Interactions: Get Saved Jobs (Implicit Identity)
const getSavedJobs = async (req, res) => {
    try {
        const seekerId = req.user.seekerProfile;
        const seeker = await Seeker.findById(seekerId).populate({
            path: "savedJobs",
            populate: { path: "postedBy", select: "companyName companyLogo" }
        });
        return res.status(200).json({ success: true, savedJobs: seeker.savedJobs });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 15. Interactions: Get Application Details
const getApplicationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Applicant.findById(id).populate("jobId companyId seekerId");
        return res.status(200).json({ success: true, application });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 16. Admin: Remove Seeker (Uses resolved :id)
const removeSeeker = async (req, res) => {
    try {
        const { id } = req.params;
        const seeker = await Seeker.findByIdAndDelete(id);
        if (!seeker) return res.status(404).json({ success: false, message: "Seeker not found" });
        
        await User.findByIdAndUpdate(seeker.userId, { seekerProfile: null, role: "User" });
        return res.status(200).json({ success: true, message: "Seeker removed" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export {
    createProfile, editProfile, getAllFactors, getAllSeekers, 
    getCustomSeekers, getMatchingJobs, getSeekerById, 
    getSeekerProfile, getUserDashboardData, getWantedAuthorities, 
    removeSeeker, toggleSaveJob, getAppliedApplications, 
    updateResume, getApplicationDetails, getSavedJobs
};
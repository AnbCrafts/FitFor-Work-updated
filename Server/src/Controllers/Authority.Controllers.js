import Authority from "../Models/Authority.Models.js";
import validator from 'validator';
import User from "../Models/User.Models.js";
import { uploadOnCloudinary } from "../Utils/CloudConfig.Utils.js";
import fs from 'fs';
import { sendNotification } from "./Notification.Controllers.js";
import Job from "../Models/Job.Models.js";
import Seeker from "../Models/Seeker.Models.js";
import mongoose from "mongoose";

const { isEmail } = validator;

// 1. Register Company (Uses req.user._id from verifyJWT)
const registerCompany = async (req, res) => {
    const logoLocalPath = req.file?.path;
    try {
        const { companyEmail, companyName, companyWebsite, companySize, industry, location, contactNumber, about, preferredSkills, preferredExperience, jobTypesOffered } = req.body;

        const ownerId = req.user._id;

        if (!companyEmail || !companyName || !companyWebsite || !contactNumber || !location) {
            if (logoLocalPath) fs.unlinkSync(logoLocalPath);
            return res.status(400).json({ success: false, message: "Missing required company fields" });
        }

        const existingProfile = await Authority.findOne({ owner: ownerId });
        if (existingProfile) {
            if (logoLocalPath) fs.unlinkSync(logoLocalPath);
            return res.status(409).json({ success: false, message: "An Authority profile already exists for this account." });
        }

        if (!logoLocalPath) return res.status(400).json({ success: false, message: "Company logo is required" });

        const uploadedLogo = await uploadOnCloudinary(logoLocalPath);
        if (fs.existsSync(logoLocalPath)) fs.unlinkSync(logoLocalPath);

        const newAuthority = await Authority.create({
            companyEmail, companyName, companyWebsite, companySize, industry, location, contactNumber, about,
            preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : preferredSkills?.split(","),
            preferredExperience,
            jobTypesOffered: Array.isArray(jobTypesOffered) ? jobTypesOffered : jobTypesOffered?.split(","),
            companyLogo: uploadedLogo.secure_url,
            owner: ownerId
        });

        await User.findByIdAndUpdate(ownerId, { authorityProfile: newAuthority._id, role: "Authority" });

        return res.status(201).json({ success: true, message: "Registered successfully", authority: newAuthority });
    } catch (error) {
        if (logoLocalPath && fs.existsSync(logoLocalPath)) fs.unlinkSync(logoLocalPath);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. Get All Companies
const getAllCompanies = async (req, res) => {
    try {
        const authorities = await Authority.find({}).lean();
        if (!authorities.length) return res.json({ success: false, message: "No Authorities found" });
        return res.json({ success: true, authorities });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching companies" });
    }
};

// 3. Get Company By ID
const getCompaniesById = async (req, res) => {
    try {
        const { authorityId } = req.params;
        const authority = await Authority.findById(authorityId).populate("owner", "firstName lastName email");
        if (!authority) return res.json({ success: false, message: "Authority not found" });
        return res.json({ success: true, authority });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching company" });
    }
};

// 4. Remove Company (Uses resolved :id)
const removeCompany = async (req, res) => {
    try {
        const authorityId = req.params.id; // From resolveIdentity
        const authority = await Authority.findByIdAndDelete(authorityId);

        if (!authority) return res.json({ success: false, message: "Cannot delete Authority" });

        await sendNotification({
            recipientId: authority.owner,
            title: "Removal of Employer Profile",
            subject: `Your profile for ${authority.companyName} was removed.`,
            type: "authority-deletion"
        });

        return res.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error during deletion" });
    }
};

// 5. Get Company By Owner (Self or Admin)
const getCompanyByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        if (req.user.role !== "Admin" && req.user._id.toString() !== ownerId) {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }

        const authority = await Authority.findOne({ owner: ownerId })
            .populate("owner", "firstName lastName email")
            .populate({ path: "jobs", options: { sort: { createdAt: -1 }, limit: 5 } })
            .lean();

        if (!authority) return res.status(404).json({ success: false, message: "Profile not found" });

        return res.status(200).json({ success: true, authority });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 6. Get Matching Seekers (Uses resolved :id)
const getMatchingSeekers = async (req, res) => {
    try {
        const authId = req.params.id; // From resolveIdentity
        const authority = await Authority.findById(authId).populate("jobs");
        if (!authority) return res.status(404).json({ success: false, message: "Authority not found" });

        const uniqueSkills = new Set(authority.preferredSkills.map(s => s.toLowerCase()));
        authority.jobs.forEach(job => {
            job.skillsRequired?.forEach(s => uniqueSkills.add(s.toLowerCase()));
        });

        const seekers = await Seeker.find({ 
            skills: { $in: Array.from(uniqueSkills) } 
        }).populate("userId", "firstName lastName email picture phone").lean();

        return res.status(200).json({ success: true, totalMatches: seekers.length, seekers });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Matching error" });
    }
};

// 7. Edit Profile (Uses resolved :id)
const editProfile = async (req, res) => {
    try {
        const authId = req.params.id; // From resolveIdentity
        const updatedAuthority = await Authority.findByIdAndUpdate(authId, req.body, { new: true, runValidators: true });

        if (!updatedAuthority) return res.status(404).json({ success: false, message: "Authority not found" });

        return res.status(200).json({ success: true, message: "Profile updated", authority: updatedAuthority });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 8. Update Preferred Skills (Maintenance Task)
const updateAuthoritiesPreferredSkills = async (req, res) => {
    try {
        const authorities = await Authority.find({}).populate("jobs");
        const updatedIds = [];

        for (const auth of authorities) {
            const skillSet = new Set(auth.preferredSkills.map(s => s.toLowerCase()));
            let changed = false;

            auth.jobs.forEach(job => {
                job.skillsRequired?.forEach(skill => {
                    if (!skillSet.has(skill.toLowerCase())) {
                        auth.preferredSkills.push(skill);
                        skillSet.add(skill.toLowerCase());
                        changed = true;
                    }
                });
            });

            if (changed) {
                await auth.save();
                updatedIds.push(auth._id);
            }
        }
        return res.json({ success: true, totalUpdated: updatedIds.length });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Skills update failed" });
    }
};

// 9. Get All Company Names (Public)
const getAllCompanyNames = async (req, res) => {
    try {
        const companies = await Authority.find({}, 'companyName').sort({ companyName: 1 });
        return res.json({ success: true, companyNames: companies.map(c => c.companyName) });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch names" });
    }
};

export { registerCompany, getAllCompanies, getCompaniesById, removeCompany, getCompanyByOwner, getMatchingSeekers, editProfile, updateAuthoritiesPreferredSkills, getAllCompanyNames };
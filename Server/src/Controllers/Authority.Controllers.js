import Authority from "../Models/Authority.Models.js";
import validator from 'validator';
import User from "../Models/User.Models.js";
import { uploadOnCloudinary } from "../Utils/CloudConfig.Utils.js";
import fs from 'fs'
import { sendNotification } from "./Notification.Controllers.js";
import Job from "../Models/Job.Models.js";
import Seeker from "../Models/Seeker.Models.js";
import mongoose from "mongoose";

const { isEmail } = validator;
  


const registerCompany = async (req, res) => {
    const logoLocalPath = req.file?.path;

    try {
        const {
            companyEmail,
            companyName,
            companyWebsite,
            companySize,
            industry,
            location,
            contactNumber,
            about,
            preferredSkills,
            preferredExperience,
            jobTypesOffered
        } = req.body;

        // 1. Security & Validation: Use req.user._id from verifyJWT
        const ownerId = req.user._id;

        if (!companyEmail || !companyName || !companyWebsite || !contactNumber || !location) {
            if (logoLocalPath) fs.unlinkSync(logoLocalPath);
            return res.status(400).json({ success: false, message: "Missing required company fields" });
        }

        // 2. Prevent Duplicate Authority Profiles for one User
        const existingProfile = await Authority.findOne({ owner: ownerId });
        if (existingProfile) {
            if (logoLocalPath) fs.unlinkSync(logoLocalPath);
            return res.status(409).json({ success: false, message: "An Authority profile already exists for this account." });
        }

        // 3. Prevent Brand/Email Conflicts
        const brandConflict = await Authority.findOne({
            $or: [{ companyEmail }, { companyName: companyName.trim() }]
        });
        if (brandConflict) {
            if (logoLocalPath) fs.unlinkSync(logoLocalPath);
            return res.status(409).json({ success: false, message: "Company name or email is already registered" });
        }

        // 4. Handle Logo Upload
        if (!logoLocalPath) {
            return res.status(400).json({ success: false, message: "Company logo is required for branding" });
        }

        const uploadedLogo = await uploadOnCloudinary(logoLocalPath);
        if (!uploadedLogo) {
            return res.status(500).json({ success: false, message: "Logo upload failed" });
        }
        if (fs.existsSync(logoLocalPath)) fs.unlinkSync(logoLocalPath);

        // 5. Create Authority Profile
        const newAuthority = await Authority.create({
            companyEmail,
            companyName,
            companyWebsite,
            companySize,
            industry,
            location,
            contactNumber,
            about,
            preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : preferredSkills?.split(","),
            preferredExperience,
            jobTypesOffered: Array.isArray(jobTypesOffered) ? jobTypesOffered : jobTypesOffered?.split(","),
            companyLogo: uploadedLogo.secure_url,
            owner: ownerId
        });

        // 6. LINKING: Update User document to reference the Authority profile
        // This is critical for populate('authorityProfile') calls later
        await User.findByIdAndUpdate(ownerId, { 
            authorityProfile: newAuthority._id,
            role: "Authority" // Optional: Auto-promote role on registration
        });

        // 7. Notification (The Snapshot for Admin/User)
        sendNotification({
            recipientId: ownerId,
            title: "Welcome to the Platform! 🏢",
            subject: `Your company ${companyName} is now registered. Start posting jobs!`,
            type: "authority-registration",
            metaData: {
                authorityId: newAuthority._id,
                name: companyName,
                logo: uploadedLogo.secure_url
            }
        }).catch(err => console.error("Registration notification failed:", err));

        return res.status(201).json({
            success: true,
            message: "Authority profile registered successfully",
            authority: newAuthority
        });

    } catch (error) {
        if (logoLocalPath && fs.existsSync(logoLocalPath)) fs.unlinkSync(logoLocalPath);
        console.error("Authority Registration Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
const getAllCompanies = async (req,res)=>{
    try {
        const authorities = await Authority.find({});

        if(!authorities){
        return res.json({success:false,message:"Cannot get Authorities"})

        }
        if(!authorities.length>0){
        return res.json({success:false,message:"There are no Authorities"})

        }
        return res.json({success:true,message:"Got all the authorities",authorities})
                
    } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Something error occurred"})
    }
}
const getCompaniesById = async (req,res)=>{
    try {
        const {authorityId} = req.params;
        if(!authorityId){
        return res.json({success:false,message:"Cannot get Authority id"})
            
        }
        const authority = await Authority.findById(authorityId);

        if(!authority){
        return res.json({success:false,message:"Cannot get Authority for this id"})

        }
         
        return res.json({success:true,message:"Got all the authorities",authority})
                
    } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Something error occurred"})
    }
}
const removeCompany = async (req,res)=>{
    try {
        const {authorityId} = req.params;
        if(!authorityId){
        return res.json({success:false,message:"Cannot get Authority id"})
            
        }
        const authority = await Authority.findOneAndDelete(authorityId);

        if(!authority){
        return res.json({success:false,message:"Cannot delete Authority for this id"})

        }
        const sub = `Your Employer Profile was deleted by the admin , hope ypu understand the protocols of the platform and respect the action`

   await sendNotification({
  title: "Removal of Employer Profile",
  subject: sub,
  type: "authority-deletion",
 metaData: {
  authority: {
    id: authorityId,
    ownerId:authority.owner,
    name:authority.companyName
    
  }
  
}


   })
        
        return res.json({success:true,message:"deleted the the authority"})
                
    } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Something error occurred"})
    }
}

const getCompanyByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;

        // 1. Validation: Is the ID a valid MongoDB ObjectId?
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Owner ID format" 
            });
        }

        // 2. Security: Authorization Check
        // Only the owner themselves or an Admin should be able to see the full profile.
        if (req.user.role !== "Admin" && req.user._id.toString() !== ownerId) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized: You cannot access this company profile." 
            });
        }

        // 3. Fetch and Populate
        // We populate 'owner' to get User details (Name, Email)
        // We populate 'jobs' to show their active listings on the dashboard
        const authority = await Authority.findOne({ owner: ownerId })
            .populate("owner", "firstName lastName email phone")
            .populate({
                path: "jobs",
                select: "title jobRole status applicantCount deadline",
                options: { sort: { createdAt: -1 }, limit: 5 } // Only latest 5 for quick view
            })
            .lean();

        if (!authority) {
            return res.status(404).json({ 
                success: false, 
                message: "No company profile found associated with this user." 
            });
        }

        // 4. Response
        return res.status(200).json({
            success: true,
            message: "Company profile retrieved successfully",
            authority
        });

    } catch (error) {
        console.error(`Error in getCompanyByOwner for ID ${req.params.ownerId}:`, error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};
const getMatchingSeekers = async (req, res) => {
  try {
    const { authId } = req.params;
    if (!authId) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }

    const authority = await Authority.findById(authId).populate("jobs");
    if (!authority) {
      return res.status(404).json({ success: false, message: "Authority not found" });
    }

    // Extract and normalize preferred skills
    let preferredSkills = [];
    for (const skill of authority.preferredSkills || []) {
      const splitSkills = skill.split(",").map(s => s.trim().toLowerCase());
      preferredSkills.push(...splitSkills);
    } 

    // Extract and normalize job skills
    let jobSkills = [];
    for (const jobId of authority.jobs || []) {
      const job = await Job.findById(jobId).select("skillsRequired");
      if (job && Array.isArray(job.skillsRequired)) {
        for (const skill of job.skillsRequired) {
          const splitSkills = skill.split(",").map(s => s.trim().toLowerCase());
          jobSkills.push(...splitSkills);
        }
      }
    } 

    // Combine and deduplicate
    const uniqueSkills = Array.from(new Set([...preferredSkills, ...jobSkills]));

    const allSeekers = await Seeker.find().lean();

    const matchedSeekers = [];

    for (const seeker of allSeekers) {
      let seekerSkills = [];

      for (const skill of seeker.skills || []) {
        const splitSkills = skill.split(",").map(s => s.trim().toLowerCase());
        seekerSkills.push(...splitSkills);
      }

      const hasMatchingSkill = seekerSkills.some(skill =>
        uniqueSkills.includes(skill)
      );

      if (hasMatchingSkill) {
        const user = await User.findById(seeker.userId).lean();

        if (user) {
          matchedSeekers.push({
            // From User
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            picture: user.picture,
            address: user.address,

            // From Seeker
            desiredPost: seeker.desiredPost,
            status: seeker.status,
            skills: seeker.skills,
            experience: seeker.experience,
            qualifications: seeker.qualifications,
            resume: seeker.resume,
            preferredLocation: seeker.preferredLocation,
            preferredJobType: seeker.preferredJobType,
            availableFrom: seeker.availableFrom,
            currentCompany: seeker.currentCompany,
            currentPost: seeker.currentPost,
            currentCTC: seeker.currentCTC,
            expectedCTC: seeker.expectedCTC,
            portfolioLink: seeker.portfolioLink,
            certifications: seeker.certifications,
            languagesKnown: seeker.languagesKnown,
            achievements: seeker.achievements,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Matching seekers fetched successfully",
      totalMatches: matchedSeekers.length,
      matchedSkills: uniqueSkills,
      seekers: matchedSeekers,
    });

  } catch (error) {
    console.error("Error in getMatchingSeekers:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};

const editProfile = async(req,res)=>{
  try {
    const {authId} = req.params;
    const updates = req.body;
    if (!authId) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }
    const authority = await Authority.findById(authId);
    if (!authority) {
      return res.status(404).json({ success: false, message: "Authority not found" });
    }
    const updatedAuthority = await Authority.findByIdAndUpdate(authId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedAuthority) {
      return res.status(404).json({ success: false, message: "Authority not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      authority: updatedAuthority,
    });

    
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

const updateAuthoritiesPreferredSkills = async (req, res) => {
  try {
    const authorities = await Authority.find({}).populate("jobs");

    const updatedAuthorityIds = [];

    for (const authority of authorities) {
      const existingSkills = authority.preferredSkills?.map(skill =>
        skill.trim().toLowerCase()
      ) || [];

      const newSkillsSet = new Set(existingSkills);

      let hasNewSkill = false;

      for (const job of authority.jobs) {
        if (job.skillsRequired && Array.isArray(job.skillsRequired)) {
          for (const skill of job.skillsRequired) {
            const normalizedSkill = skill.trim().toLowerCase();
            if (!newSkillsSet.has(normalizedSkill)) {
              newSkillsSet.add(normalizedSkill);
              authority.preferredSkills.push(skill.trim()); // preserve original case
              hasNewSkill = true;
            }
          }
        }
      }

      if (hasNewSkill) {
        await authority.save();
        updatedAuthorityIds.push(authority._id);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Preferred skills updated for authorities",
      updatedAuthorityIds,
      totalUpdated: updatedAuthorityIds.length
    });

  } catch (error) {
    console.error("Error updating preferred skills:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

const getAllCompanyNames = async (req, res) => {
  try {
    const companies = await Authority.find({}, 'companyName').sort({ companyName: 1 });

    const companyNames = companies.map(c => c.companyName);

    res.status(200).json({
      success: true,
      companyNames 
    });
  } catch (error) {
    console.error("Error fetching company names:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company names"
    });
  }
};
 








export {registerCompany,getAllCompanies,getCompaniesById,removeCompany,getCompanyByOwner,getMatchingSeekers,editProfile,updateAuthoritiesPreferredSkills,getAllCompanyNames}

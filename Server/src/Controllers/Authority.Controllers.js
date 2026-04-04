import Authority from "../Models/Authority.Models.js";
import validator from 'validator';
import User from "../Models/User.Models.js";
import { uploadOnCloudinary } from "../Utils/CloudConfig.Utils.js";
import fs from 'fs'
import { sendNotification } from "./Notification.Controllers.js";
import Job from "../Models/Job.Models.js";
import Seeker from "../Models/Seeker.Models.js";

const { isEmail } = validator;
  
 
const registerCompany = async (req, res) => {
  try {
    const {
      owner,
      companyEmail,
      companyName,
      companyLogo,
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

    console.log("BODY -> ", req.body);
    console.log("FILE -> ", req.files);
    console.log("LOGO -> ", companyLogo)

    if (!owner || !companyEmail || !companyName || !companyWebsite || !contactNumber || !location) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    

    if (!isEmail(companyEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid email" });
    }

    const logoPath = req.file?.path;
   

    if (!logoPath) {
      return res.status(400).json({ success: false, message: "Company logo is required" });
    }

    const uploadedLogo = await uploadOnCloudinary(logoPath);
    if(!uploadedLogo){
      return res.status(500).json({ success: false, message: "Owner user not found" });

    }
    fs.unlinkSync(logoPath);
    const existingUser = await User.findById(owner);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "Owner user not found" });
    }

    const existing = await Authority.findOne({
      $or: [{ companyEmail }, { companyName }]
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "Company already registered" });
    }


    const newAuthority = new Authority({
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
      jobTypesOffered,
      companyLogo: uploadedLogo.secure_url,
      owner
    });

    await newAuthority.save();

    const sub = `A new Employer has created its profile and registered for the Employer form`

   await sendNotification({
  title: "Created Employer Profile",
  subject: sub,
  type: "authority-registration",
 metaData: {
  authority: {
    id: newAuthority._id,
    ownerId:newAuthority.owner,
    name:newAuthority.companyName
    
  }
  
}


   })

    return res.status(201).json({
      success: true,
      message: "Authority registered successfully",
      authority: newAuthority
    });

    

  } catch (error) {
    console.error("Registration error:", error);
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

    if (!ownerId) {
      return res.status(400).json({ success: false, message: "Owner ID is required" });
    }

    const authority = await Authority.findOne({ owner: ownerId });

    if (!authority) {
      return res.status(404).json({ success: false, message: "Authority not found for this owner ID" });
    }

    return res.status(200).json({ success: true, message: "Authority found", authority });
  } catch (error) {
    console.error("Error in getCompanyByOwner:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
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

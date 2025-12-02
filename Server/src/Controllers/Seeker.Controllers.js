import validator from 'validator';
import Seeker from '../Models/Seeker.Models.js';
import User from "../Models/User.Models.js";
import Notification from "../Models/Notification.Models.js";
import { uploadOnCloudinary } from '../Utils/CloudConfig.Utils.js';
import fs from 'fs'
import Job from '../Models/Job.Models.js';
import Authority from '../Models/Authority.Models.js';


const createProfile = async (req, res) => {
    const toArray = (value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === "string") return value.split(",").map(v => v.trim());
        return [];
    };

    try {


        const {
            userId,
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
            achievements,
            resume
        } = req.body;

        const resumePath = req.file?.path;
        let uploadedResume = "";
        if (resumePath) {
         uploadedResume= await uploadOnCloudinary(resumePath);
            if (!uploadedResume) {
                return res.status(500).json({ error: "Failed to upload resume to Cloudinary." });
            }
    
            fs.unlinkSync(resumePath)
        }



        if (!userId || !desiredPost || !status || !skills || skills.length === 0 || !qualifications || !preferredLocation || !preferredJobType || !languagesKnown) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const validUser = await User.findById(userId);
        if (!validUser) {
            return res.json({ success: false, message: "You need to create an account first" })
        }

        const newSeeker = new Seeker({
            userId,
            desiredPost,
            status,
            skills: toArray(skills),
            experience: Number(experience),
            qualifications,
            resume: uploadedResume.secure_url ||"",
            preferredLocation,
            preferredJobType,
            availableFrom,
            currentCompany,
            currentPost,
            currentCTC: Number(currentCTC),
            expectedCTC: Number(expectedCTC),
            portfolioLink,
            certifications: toArray(certifications),
            languagesKnown: toArray(languagesKnown),
            achievements: toArray(achievements),
        });

        await newSeeker.save();



        return res.json({ success: true, message: "Your profile was successfully created", newSeeker })





    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: "Something error occurred" })
    }

}
const getAllSeekers = async (req, res) => {
    try {
        const seeker = await Seeker.find({});
        if (!seeker) {
            return res.json({ success: false, message: "Cannot find seekers" })

        }
        if (!seeker.length > 0) {
            return res.json({ success: false, message: "no seekers found" })

        }
        return res.json({ success: true, message: "Found all the Seekers", seeker });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Something error occurred" })
    }
}
const getSeekerById = async (req, res) => {
    try {
        const { seekerId } = req.params;
        if (!seekerId) {
            return res.json({ success: false, message: "Cannot get seeker id" })
        }
        const seeker = await Seeker.findById(seekerId);
        if (!seeker) {
            return res.json({ success: false, message: "Cannot find seeker with this id" })

        }

        return res.json({ success: true, message: "Found  the Seeker for this id", seeker });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Something error occurred" })
    }
}
const getSeekerByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.json({ success: false, message: "Cannot get userId id" })
        }


        const seeker = await Seeker.findOne({ userId: userId });
        if (!seeker) {
            return res.json({ success: false, message: "Cannot find seeker with this id" })

        }

        return res.json({ success: true, message: "Found  the Seeker for this id", seeker });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Something error occurred" })
    }
}
const removeSeeker = async (req, res) => {
    try {
        const { seekerId } = req.params;
        if (!seekerId) {
            return res.json({ success: false, message: "Cannot get seeker id" })
        }
        const seeker = await Seeker.findByIdAndDelete(seekerId);
        if (!seeker) {
            return res.json({ success: false, message: "Cannot delete seeker with this id" })
        }

        return res.json({ success: true, message: "Deleted  the Seeker for this id" });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Something error occurred" })
    }
}

const pushItem = (arr, item) => {
    if (item && !arr.includes(item)) {
        arr.push(item);
    }
};
const getAllFactors = async (req, res) => {
    try {
        const seekers = await Seeker.find({});

        if (!seekers || seekers.length === 0) {
            return res.json({ success: false, message: "Cannot get Seekers" });
        }

        let allSkills = {
            skills: [],
            certifications: [],
            languagesKnown: [],
            achievements: [],
            experiences: [],
            availability: [],
            status: [],
            desiredPost: [],
            qualifications: [],
            preferredLocation: [],
            preferredJobType: [],
            expectedCTC: []
        };

        seekers.forEach(seeker => {
            pushItem(allSkills.experiences, seeker.experience.toString() + " Years");
            pushItem(allSkills.availability, seeker.availableFrom);
            pushItem(allSkills.status, seeker.status);
            pushItem(allSkills.desiredPost, seeker.desiredPost);
            pushItem(allSkills.qualifications, seeker.qualifications);
            pushItem(allSkills.preferredLocation, seeker.preferredLocation);
            pushItem(allSkills.preferredJobType, seeker.preferredJobType);
            pushItem(allSkills.expectedCTC, seeker.expectedCTC);

            seeker.skills?.forEach(item => pushItem(allSkills.skills, item));
            seeker.achievements?.forEach(item => pushItem(allSkills.achievements, item));
            seeker.languagesKnown?.forEach(item => pushItem(allSkills.languagesKnown, item));
            seeker.certifications?.forEach(item => pushItem(allSkills.certifications, item));
        });

        return res.json({
            success: true,
            message: "Got all unique factors",
            allSkills
        });
    } catch (error) {
        console.error("❌ Error in getAllFactors:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error
        });
    }
};
const getCustomSeekers = async (req, res) => {
  try {
    const {
      skills,
      certifications,
      languagesKnown,
      achievements,
      experiences,
      availability,
      status,
      desiredPost,
      qualifications,
      preferredLocation,
      preferredJobType,
      expectedCTC
    } = req.query;

    let filterQuery = {};

    // For fields that accept arrays or single values
    const applyInFilter = (field, value) => {
      if (value) {
        filterQuery[field] = {
          $in: Array.isArray(value) ? value : [value]
        };
      }
    };

    applyInFilter("skills", skills);
    applyInFilter("certifications", certifications);
    applyInFilter("languagesKnown", languagesKnown);
    applyInFilter("achievements", achievements);

    // For exact numeric match
    if (experiences !== undefined) {
      filterQuery.experience = Number(experiences);
    }

    if (expectedCTC !== undefined) {
      filterQuery.expectedCTC = Number(expectedCTC);
    }

    // For exact date match
    if (availability) {
      filterQuery.availableFrom = new Date(availability);
    }

    // Case-insensitive exact string matches
    const applyRegexFilter = (field, value) => {
      if (value) {
        filterQuery[field] = {
          $regex: `^${value}$`, // ^ and $ ensure exact match
          $options: 'i' // case-insensitive
        };
      }
    };

    applyRegexFilter("status", status);
    applyRegexFilter("desiredPost", desiredPost);
    applyRegexFilter("qualifications", qualifications);
    applyRegexFilter("preferredLocation", preferredLocation);
    applyRegexFilter("preferredJobType", preferredJobType);

    const seekers = await Seeker.find(filterQuery);

    return res.status(200).json({
      success: true,
      message: "Filtered seekers fetched successfully.",
      seekers
    });

  } catch (error) {
    console.error("❌ Error in getCustomSeekers:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error
    });
  }
};

const getMatchingJobs = async (req, res) => {
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

    const seekerSkills = seeker.skills?.map(skill => skill.trim()) || [];
    if (seekerSkills.length === 0) {
      return res.status(404).json({ success: false, message: "No skills found for this seeker" });
    }

    // Get total count first
    const totalMatches = await Job.countDocuments({
      skillsRequired: { $in: seekerSkills }
    });

    // Fetch paginated jobs
    const paginatedJobs = await Job.find({
      skillsRequired: { $in: seekerSkills }
    })
      .skip(skip)
      .limit(limit)
      .select('_id title description location type salary experienceRequired skillsRequired companyId') // Optional: keep only public fields
      .populate('companyId', 'companyName companyLogo'); // Optional: populate company info

    return res.status(200).json({
      success: true,
      message: "Matching jobs fetched successfully",
      totalMatches,
      currentPage: page,
      totalPages: Math.ceil(totalMatches / limit),
      jobs: paginatedJobs,
    });

  } catch (error) {
    console.error("Error in getMatchingJobs:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
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
};

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
    if (!seekerId) return res.json({ success: false, message: "Cannot get seeker id" });

    const seeker = await Seeker.findById(seekerId)
      .populate("appliedFor")
      .populate("savedJobs")
      .populate("rejectedApplications")
      .populate("offeredJobs")
      .lean();

    if (!seeker) return res.json({ success: false, message: "Cannot find seeker with this id" });

    // Basic arrays
    const skills = seeker.skills || [];
    const applied = seeker.appliedFor || [];
    const saved = seeker.savedJobs || [];
    const rejected = seeker.rejectedApplications || [];
    const offered = seeker.offeredJobs || [];

    // Preference (added skills)
    const preference = {
      post: seeker.desiredPost || "",
      ctc: seeker.expectedCTC || 0,
      qualifications: seeker.qualifications || "",
      location: seeker.preferredLocation || "",
      type: seeker.preferredJobType || "",
      status: seeker.status || "Fresher",
      skills: skills // <-- new field
    };

    // Build flexible conditions (use regex for strings; $in for arrays)
    const conditions = [];

    // job role / post (try jobRole and post fields)
    if (preference.post) {
      const r = { $regex: preference.post, $options: "i" };
      conditions.push({ jobRole: r });
      conditions.push({ title: r });
      // optional: also check `post` if you sometimes used that name
      conditions.push({ post: r });
    }

    // qualifications (string)
    if (preference.qualifications) {
      conditions.push({ qualifications: { $regex: preference.qualifications, $options: "i" } });
    }

    // location
    if (preference.location) {
      conditions.push({ location: { $regex: preference.location, $options: "i" } });
    }

    // job type (enum Job.jobType)
    if (preference.type) {
      conditions.push({ jobType: preference.type }); // exact match to enum
      conditions.push({ type: preference.type }); // fallback if different field name used
    }

    // skills matching: at least one skill in common (you can change to $all if you want all skills)
    if (Array.isArray(preference.skills) && preference.skills.length > 0) {
      conditions.push({ skillsRequired: { $in: preference.skills } });
    }

    // experience / status: Job.experienceRequired is a String in your schema.
    // For "Fresher" seekers match jobs where experienceRequired looks like fresher/0 or is empty.
    if (preference.status === "Fresher") {
      conditions.push({
        $or: [
          { experienceRequired: { $regex: /fresher|entry|0|0-1|0-2/i } },
          { experienceRequired: { $exists: false } },
          { experienceRequired: "" }
        ]
      });
    } else {
      // For experienced seekers we avoid filtering out jobs that explicitly require "Fresher"
      // (i.e. we only exclude jobs explicitly marked as "Fresher" if you want to)
      // Here we'll just NOT add any strict experience filter; you can make it stricter if you store numeric ranges.
    }

    // salary/ctc: salaryRange is a string in Job schema.
    // Numeric comparison is unreliable for string ranges — we do a best-effort regex check
    // but strongly recommend storing numeric minSalary / maxSalary fields for accurate filtering.
    if (preference.ctc && typeof preference.ctc === "number" && preference.ctc > 0) {
      // try to match salary strings that contain the expected number, or simple comparators
      // This is a heuristic — not guaranteed to work for all salary formats.
      const salaryRegex = new RegExp(preference.ctc.toString());
      conditions.push({
        $or: [
          { salaryRange: { $regex: salaryRegex } },
          { salaryRange: { $regex: /lpa|lakhs|per annum|annum/i } }, // broad fallback so we don't accidentally exclude everything
        ]
      });
      // NOTE: best fix: migrate schema to numeric salaryMin / salaryMax fields
    }

    // Compose final query
    const query = conditions.length ? { $and: conditions } : {};

    // Debug logs (remove in production)
    // console.log("Preference:", preference);
    // console.log("Query:", JSON.stringify(query, null, 2));
    const matchCount = await Job.countDocuments(query);
    // console.log("Matching jobs count:", matchCount);

    // Fetch jobs (with limit)
    const jobs = await Job.find(query).limit(200).lean();

    const userDashboard = {
      skills,
      applied,
      saved,
      rejected,
      offered,
      jobs,
      preference
    };

    return res.json({
      success: true,
      message: "Found seeker and dashboard data",
      userDashboard
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};













export {editProfile, createProfile, getAllSeekers, getSeekerById, removeSeeker, getSeekerByUserId, getAllFactors,getCustomSeekers,getMatchingJobs,getWantedAuthorities,getUserDashboardData }
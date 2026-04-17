import validator from 'validator';
import Authority from '../Models/Authority.Models.js';
import Job from '../Models/Job.Models.js';
import mongoose from 'mongoose';
import Seeker from '../Models/Seeker.Models.js';
import Applicant from '../Models/Applicant.Models.js';
import { sendNotification } from './Notification.Controllers.js';

// 1. Create Job (Implicit Authority Identity)
const createJob = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { category, title, jobRole, description, skillsRequired, experienceRequired, jobType, salaryRange, location, totalSeats, deadline, status = "Active" } = req.body;

        // Identification: Get Authority Profile from verified cookie session
        const postedBy = req.user.authorityProfile; 

        if (!title || !description || !skillsRequired || !postedBy || !deadline || !totalSeats || !jobRole) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const authority = await Authority.findById(postedBy).session(session);
        if (!authority) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Employer profile not found" });
        }

        // Duplicate Check
        const existingJob = await Job.findOne({ title: title.trim(), location: location.trim(), postedBy, jobRole }).session(session);
        if (existingJob) {
            await session.abortTransaction();
            return res.status(409).json({ success: false, message: "This job has already been posted" });
        }

        const newJob = await Job.create([{
            title, totalSeats, description, skillsRequired, experienceRequired, jobType, salaryRange, location, postedBy, deadline, status, jobRole, category
        }], { session });

        const jobId = newJob[0]._id;
        const normalizedSkills = skillsRequired.map(s => s.trim());
        
        await Authority.findByIdAndUpdate(postedBy, {
            $push: { jobs: jobId },
            $addToSet: { preferredSkills: { $each: normalizedSkills } }
        }, { session });

        await session.commitTransaction();
        session.endSession();

        // Broadcast Notification
        sendNotification({
            recipientId: "ALL_RELEVANT_SEEKERS",
            title: "New Job Alert! 📢",
            subject: `New Opportunity: ${jobRole} position open at ${location}.`,
            type: "job_alert",
            metaData: { jobId, title, companyName: authority.companyName }
        }).catch(err => console.error("Broadcast failed:", err));

        return res.status(201).json({ success: true, job: newJob[0] });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Jobs (Public)
const getAllJobs = async (req, res) => {
    try {
        // 1. EXTRACT QUERY PARAMS
        // Defaults: Page 1, Limit 10, Sort by newest
        const { 
            page = 1, 
            limit = 10, 
            category, 
            location, 
            jobType, 
            search, 
            sort = "-createdAt" 
        } = req.query;

        // 2. BUILD DYNAMIC FILTER OBJECT
        const queryObj = { status: "Open" };

        if (category) queryObj.category = category;
        if (location) queryObj.location = { $regex: location, $options: "i" }; // Case-insensitive
        if (jobType) queryObj.jobType = jobType;
        
        // Advanced Search (Search in Title or Description)
        if (search) {
            queryObj.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // 3. EXECUTE QUERY WITH PAGINATION
        const skip = (Number(page) - 1) * Number(limit);

        const jobs = await Job.find(queryObj)
            .populate("postedBy", "companyName companyLogo")
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        // 4. GET TOTAL COUNT FOR FRONTEND PAGINATION
        const totalJobs = await Job.countDocuments(queryObj);

        return res.status(200).json({
            success: true,
            count: jobs.length,
            totalJobs,
            totalPages: Math.ceil(totalJobs / limit),
            currentPage: Number(page),
            jobs
        });

    } catch (error) {
        console.error("GET_ALL_JOBS_ERROR:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to fetch jobs", 
            error: error.message 
        });
    }
};

// 3. Apply For Job (Implicit Seeker Identity)

 const applyForJob = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        // 1. MANUALLY FIND SEEKER (The Bulletproof Way)
        // This avoids issues with what is or isn't in the JWT/req.user
        const seeker = await Seeker.findOne({ userId }).session(session);

        if (!seeker || req.user.role !== 'Seeker') {
            await session.abortTransaction();
            return res.status(403).json({ 
                success: false, 
                message: "Forbidden: Only Seeker profiles can apply for jobs." 
            });
        }

        const seekerId = seeker._id;

        // 2. VALIDATE JOB
        const job = await Job.findById(jobId).session(session);
        if (!job) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Job listing not found." });
        }

        if (job.status !== "Open" || new Date(job.deadline) < new Date()) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Application period has ended." });
        }

        // 3. DUPLICATE CHECK
        const alreadyApplied = await Applicant.findOne({ jobId, seekerId }).session(session);
        if (alreadyApplied) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "You have already applied." });
        }

        // 4. CREATE APPLICATION
        const newApplicant = await Applicant.create([{
            jobId, 
            seekerId, 
            companyId: job.postedBy, 
            status: 'Under Review'
        }], { session });

        const applicantId = newApplicant[0]._id;

        // 5. ATOMIC UPDATES
        await Authority.findByIdAndUpdate(job.postedBy, { $push: { SeekersToReview: applicantId } }, { session });
        await Seeker.findByIdAndUpdate(seekerId, { $addToSet: { appliedFor: jobId } }, { session });
        await Job.findByIdAndUpdate(jobId, { 
            $push: { applicants: seekerId }, 
            $inc: { applicantCount: 1 } 
        }, { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ success: true, message: "Applied successfully!" });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        session.endSession();
        console.error("APPLY_ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Save Job (Implicit Seeker Identity)
 const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // 1. Extract Seeker ID safely from the user session
    // Handles both populated object or raw ID string
    const seekerId = req.user?.seekerProfile?._id || req.user?.seekerProfile;

    if (!seekerId) {
      return res.status(403).json({ 
        success: false, 
        message: "Only Seeker profiles can save jobs." 
      });
    }

    // 2. Find the Seeker document
    const seeker = await Seeker.findById(seekerId);
    if (!seeker) {
      return res.status(404).json({ 
        success: false, 
        message: "Seeker profile not found in database." 
      });
    }

    // 3. Toggle Save Logic (Prevent duplicates)
    const isAlreadySaved = seeker.savedJobs.includes(jobId);
    
    if (isAlreadySaved) {
      // If already saved, remove it (Toggle behavior)
      seeker.savedJobs = seeker.savedJobs.filter(id => id.toString() !== jobId);
      await seeker.save();
      return res.status(200).json({ success: true, message: "Job removed from shortlist" });
    } else {
      // If not saved, add it
      seeker.savedJobs.push(jobId);
      await seeker.save();
      return res.status(200).json({ success: true, message: "Job saved successfully!" });
    }

  } catch (error) {
    console.error("SAVE_JOB_ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// 5. Get Saved Jobs (Implicit Seeker Identity)
const getSavedJobBySeekerId = async (req, res) => {
  try {
    const seekerId = req.user.seekerProfile;
    const seeker = await Seeker.findById(seekerId).populate({
        path: "savedJobs",
        populate: { path: "postedBy", select: "companyName companyLogo" }
    });

    if (!seeker) return res.status(404).json({ success: false, message: "Seeker not found" });
    return res.status(200).json({ success: true, savedJobs: seeker.savedJobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get Jobs by Authority (Implicit Authority Identity)
const getAllJobsByAuthorityId = async (req, res) => {
  try {
    const AuthId = req.user.authorityProfile; // Pulled from cookie
    const jobs = await Job.find({ postedBy: AuthId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 7. Get Job By ID (Public)
const getJobById = async(req,res)=>{
    try {
        const {jobId} = req.params;
        const job = await Job.findById(jobId).populate("postedBy", "companyName companyLogo about industry");
        if(!job) return res.status(404).json({ success: false, message: "Job not found" });
        return res.json({ success: true, job });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Error" });
    }
}

// 8. Remove Job
const removeJob = async(req,res)=>{
    try {
        const {jobId} = req.params;
        const authId = req.user.authorityProfile;

        const job = await Job.findOneAndDelete({ _id: jobId, postedBy: authId });
        if(!job) return res.status(404).json({ success: false, message: "Job not found or unauthorized" });
        
        return res.json({ success: true, message: "Job removed" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error" });
    }
}

// 9. Get Customized Jobs
const getCustomizedJobs = async (req, res) => {
  try {
    const { skills, location, jobType, jobRole, minExperience, category, status } = req.query;
    let filter = { status: status || "Active" };

    if (skills) filter.skillsRequired = { $in: skills.split(',').map(s => s.trim()) };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (jobRole) filter.jobRole = { $regex: jobRole, $options: 'i' };
    if (category) filter.category = category;

    let jobs = await Job.find(filter).populate("postedBy", "companyName companyLogo industry").sort({ createdAt: -1 });

    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Error" });
  }
};

// 10. Get All Requirements (For Filters)
const getAllRequirements = async (req, res) => {
  try {
    const requirements = await Job.aggregate([
      { $facet: {
          "skills": [ { $unwind: "$skillsRequired" }, { $group: { _id: "$skillsRequired" } } ],
          "jobTypes": [ { $group: { _id: "$jobType" } } ],
          "locations": [ { $group: { _id: "$location" } } ],
          "categories": [ { $group: { _id: "$category" } } ]
      }}
    ]);
    return res.status(200).json({ success: true, categories: requirements[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Error" });
  }
};

// 11. Update Application Status
const updateApplicationStatus = async (req, res) => {
    try {
        const { applicantId } = req.params;
        const { status, feedback } = req.body;
        const applicant = await Applicant.findByIdAndUpdate(applicantId, { $set: { status, feedback } }, { new: true }).populate("jobId");
        return res.status(200).json({ success: true, applicant });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 12. Get Applicants for Job
const getApplicantsByJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const applicants = await Applicant.find({ jobId }).populate({
            path: "seekerId",
            populate: { path: "userId", select: "firstName lastName picture email" }
        }).sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, applicants });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 13. Similar Jobs
const getSimilarJobs = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false });
        const similarJobs = await Job.find({ category: job.category, _id: { $ne: jobId }, status: "Active" }).limit(4).populate("postedBy", "companyName companyLogo");
        return res.status(200).json({ success: true, jobs: similarJobs });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 14. Toggle Status
const toggleJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status } = req.body;
        const updatedJob = await Job.findByIdAndUpdate(jobId, { $set: { status } }, { new: true });
        return res.status(200).json({ success: true, job: updatedJob });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 15. Categories
const getJobCategories = async (req, res) => {
    try {
        const categories = await Job.distinct("category");
        return res.status(200).json({ success: true, categories });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

export { createJob, getAllJobs, getJobById, getJobCategories, removeJob, getAllJobsByAuthorityId, applyForJob, saveJob, getSavedJobBySeekerId, getCustomizedJobs, getAllRequirements, updateApplicationStatus, getApplicantsByJob, getSimilarJobs, toggleJobStatus };
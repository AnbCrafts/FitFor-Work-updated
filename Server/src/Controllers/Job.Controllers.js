import validator from 'validator';
import Authority from '../Models/Authority.Models.js';
import Job from '../Models/Job.Models.js';
import mongoose from 'mongoose';
import Seeker from '../Models/Seeker.Models.js';
import Applicant from '../Models/Applicant.Models.js';
import { sendNotification } from './Notification.Controllers.js';


const createJob = async (req, res) => {
    // 1. Start Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            category, title, jobRole, description,
            skillsRequired, experienceRequired, jobType,
            salaryRange, location, postedBy, totalSeats,
            deadline, status = "Active"
        } = req.body;

        // 2. Validation
        if (!title || !description || !skillsRequired || !postedBy || !deadline || !totalSeats || !jobRole) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const authority = await Authority.findById(postedBy).session(session);
        if (!authority) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Authority (Employer) not found" });
        }

        // 3. Duplicate Check
        const existingJob = await Job.findOne({
            title: title.trim(),
            location: location.trim(),
            postedBy,
            jobRole
        }).session(session);

        if (existingJob) {
            await session.abortTransaction();
            return res.status(409).json({ success: false, message: "This job has already been posted" });
        }

        // 4. Create Job Record
        const newJob = await Job.create([{
            title, totalSeats, description, skillsRequired,
            experienceRequired, jobType, salaryRange,
            location, postedBy, deadline, status,
            jobRole, category
        }], { session });

        const jobId = newJob[0]._id;

        // 5. Update Authority (Job List & Preferred Skills)
        // We use $addToSet for skills to let MongoDB handle the unique check efficiently
        const normalizedSkills = skillsRequired.map(s => s.trim());
        
        await Authority.findByIdAndUpdate(postedBy, {
            $push: { jobs: jobId },
            $addToSet: { preferredSkills: { $each: normalizedSkills } }
        }, { session });

        // 6. Commit all DB changes
        await session.commitTransaction();
        session.endSession();

        // 7. BROADCAST NOTIFICATION (The "Dual-Side" UI enhancement)
        // We trigger this after commit. For production, you might filter 
        // seekers who have matching skills to avoid spamming everyone.
        
        const broadcastSub = `New Opportunity: ${jobRole} position open at ${location}.`;
        
        // This is sent to a 'Topic' or handled as a broadcast type in your utility
        sendNotification({
            recipientId: "ALL_RELEVANT_SEEKERS", // Handled by your logic in the utility
            title: "New Job Alert! 📢",
            subject: broadcastSub,
            type: "job_alert",
            metaData: {
                jobId: jobId,
                title: title,
                companyName: authority.companyName,
                companyLogo: authority.companyLogo, // Persistent UI Card data
                skills: skillsRequired.slice(0, 3),
                salary: salaryRange
            }
        }).catch(err => console.error("Broadcast Notification failed:", err));

        return res.status(201).json({
            success: true,
            message: "Job posted and matching seekers notified",
            job: newJob[0],
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in createJob:", error);
        return res.status(500).json({ success: false, message: "Server error during job creation" });
    }
};
const getAllJobs = async(req,res)=>{
    try {
        const jobs = await Job.find({});
        if(!jobs || !jobs.length>0){
            return res.json({ success: false, message: "No Jobs found" })
        }
        return res.json({ success: true, message: "got all jobs" ,jobs})

        
    } catch (error) {
        console.log(error)
            return res.json({ success: false, message: "Something error occurred" })

    }
}
const getJobById = async(req,res)=>{
    try {
        const {jobId} = req.params;
        if(!jobId){
            return res.json({ success: false, message: "Cannot get Job Id" }) 
        }

        const job = await Job.findById(jobId);
        if(!job){
            return res.json({ success: false, message: "No Job found for this id" })
        }
        return res.json({ success: true, message: "got the job for this id" ,job})

        
    } catch (error) {
        console.log(error)
            return res.json({ success: false, message: "Something error occurred" })

    }
}
const removeJob = async(req,res)=>{
    try {
        const {jobId} = req.params;
        if(!jobId){
            return res.json({ success: false, message: "Cannot get Job Id" }) 
        }
        const job = await Job.findByIdAndDelete(jobId);
        if(!job){
            return res.json({ success: false, message: "No Job found for this id to delete" })
        }
        return res.json({ success: true, message: "deleted the job for this id" })

        
    } catch (error) {
        console.log(error)
            return res.json({ success: false, message: "Something error occurred" })

    }
}
const getAllJobsByAuthorityId = async (req, res) => {
  try {
    const { AuthId } = req.params;

    if (!AuthId) {
      return res.status(400).json({ success: false, message: "Authority Id is required" });
    }

    const jobs = await Job.find({ postedBy: AuthId });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ success: false, message: "No Jobs found for this ID" });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched all jobs for this authority",
      jobs
    });

  } catch (error) {
    console.error("Error fetching jobs by authority ID:", error);
    return res.status(500).json({ success: false, message: "Server error occurred" });
  }
};
const applyForJob = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { jobId, seekerId } = req.params;

        // 1. Initial Validations
        const job = await Job.findById(jobId).session(session);
        if (!job) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // Fetch seeker to get data for the Employer's Snapshot Card
        const seeker = await Seeker.findById(seekerId).populate("userId").session(session);
        if (!seeker) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Seeker not found" });
        }

        if (job.totalSeats <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "No seats available" });
        }

        if (new Date(job.deadline) < new Date()) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Deadline passed" });
        }

        const alreadyApplied = await Applicant.findOne({ jobId, seekerId }).session(session);
        if (alreadyApplied) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Already applied" });
        }

        // 2. Create Applicant Record (The Source of Truth)
        const newApplicant = await Applicant.create([{
            jobId,
            seekerId,
            companyId: job.postedBy,
            status: 'Under Review'
        }], { session });

        const applicantId = newApplicant[0]._id;

        // 3. Atomic Updates
        await Authority.findByIdAndUpdate(job.postedBy, { $push: { SeekersToReview: applicantId } }, { session });
        await Seeker.findByIdAndUpdate(seekerId, { $addToSet: { appliedFor: jobId } }, { session });
        await Job.findByIdAndUpdate(jobId, { $push: { applicants: applicantId }, $inc: { applicantCount: 1 } }, { session });

        await session.commitTransaction();
        session.endSession();

        // 4. DUAL-SIDE NOTIFICATIONS (The UI Enhancement Layer)
        
        // A. SEEKER NOTIFICATION (The "Tracking Card" Data)
        sendNotification({
            recipientId: seeker.userId._id,
            title: "Application Sent! 🚀",
            subject: `Successfully applied to ${job.jobRole} at ${job.companyName || 'the company'}.`,
            type: "application_seeker",
            metaData: {
                applicationId: applicantId,
                jobTitle: job.jobRole,
                companyLogo: job.companyLogo || "", // Persistent Snapshot
                status: "Under Review",
                appliedAt: new Date()
            }
        }).catch(err => console.error("Seeker Notification failed:", err));

        // B. EMPLOYER NOTIFICATION (The "Candidate Snapshot" Card)
        sendNotification({
            recipientId: job.postedBy, 
            title: "New Candidate Alert! 👤",
            subject: `${seeker.userId.firstName} ${seeker.userId.lastName} applied for ${job.jobRole}.`,
            type: "application_employer",
            metaData: {
                applicantId: applicantId,
                seekerName: `${seeker.userId.firstName} ${seeker.userId.lastName}`,
                seekerPicture: seeker.userId.picture,
                topSkills: seeker.skills.slice(0, 3), // Denormalized for the card
                experience: seeker.experience,
                matchScore: calculateMatchScore(seeker.skills, job.skillsRequired) // Your custom logic
            }
        }).catch(err => console.error("Employer Notification failed:", err));

        return res.status(200).json({ 
            success: true, 
            message: "Applied successfully. Notifications dispatched.", 
            applicantId 
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("ApplyForJob Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const saveJob = async (req, res) => {
  try {
    const { jobId, seekerId } = req.params;

    if (!seekerId || !jobId) {
      return res.status(400).json({ success: false, message: "Seeker ID and Job ID are required." });
    }

    const seeker = await Seeker.findById(seekerId);
    const job = await Job.findById(jobId);

    if (!seeker) {
      return res.status(404).json({ success: false, message: "Seeker not found." });
    }

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Check if already saved
    const alreadySaved = seeker.savedJobs.includes(jobId);

    if (alreadySaved) {
      return res.status(400).json({ success: false, message: "Job already saved." });
    }

    // Save the job
    seeker.savedJobs.push(jobId);
    await seeker.save();

    return res.status(200).json({ success: true, message: "Job saved successfully." });

  } catch (error) {
    console.error("Error in saveJob:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};
const getSavedJobBySeekerId = async (req, res) => {
  try {
    const { seekerId } = req.params;

    if (!seekerId) {
      return res.status(400).json({
        success: false,
        message: "Seeker ID is required."
      });
    }

    const seeker = await Seeker.findById(seekerId);

    if (!seeker) {
      return res.status(404).json({
        success: false,
        message: "Seeker not found."
      });
    }

    const savedJobs = seeker.savedJobs;

    if (!savedJobs || savedJobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No saved jobs found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Jobs found.",
      savedJobs
    });

  } catch (error) {
    console.error("Error in getSavedJobBySeekerId:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};
const getCustomizedJobs = async (req, res) => {
  try {
    const {
      skills,
      location,
      jobType,
      jobRole,
      minExperience,
      authorityId,
      category,
      sortBy,
      status,
    } = req.query;

    let filter = {};

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      filter.skillsRequired = { $in: skillsArray };
    }

    if (location) {
      filter.location = location;
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (jobRole) {
      filter.jobRole = jobRole;
    }

    if (minExperience) {
      // Assuming experience is stored as a number-like string e.g. "2", "3"
      filter.experienceRequired = { $gte: minExperience };
    }

    if (authorityId) {
      filter.postedBy = authorityId;
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    let sort = {};
    if (sortBy === "applicants") sort = { applicants: -1 };
    else if (sortBy === "deadline") sort = { deadline: 1 };
    else if (sortBy === "vacancies") sort = { totalSeats: -1 };
    else if (sortBy === "createdAt") sort = { createdAt: -1 };

    let jobs = await Job.find(filter)
      .populate("postedBy", "companyName industry") 
      .populate("applicants") 
      .sort(sort);

      if (minExperience) {
  const minExp = parseInt(minExperience);
  jobs = jobs.filter(job => {
    const match = job.experienceRequired.match(/\d+/);
    if (!match) return false;
    const jobExp = parseInt(match[0]);
    return jobExp >= minExp;
  });
}

    return res.status(200).json({
      success: true,
      message: "Filtered job list fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error("Error in getCustomizedJobs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const getAllRequirements = async (req, res) => {
  try {
    // 1. Use Aggregation to get unique values directly from MongoDB
    const requirements = await Job.aggregate([
      {
        $facet: {
          "skills": [ { $unwind: "$skillsRequired" }, { $group: { _id: "$skillsRequired" } } ],
          "experience": [ { $group: { _id: "$experienceRequired" } } ],
          "jobTypes": [ { $group: { _id: "$jobType" } } ],
          "roles": [ { $group: { _id: "$jobRole" } } ],
          "salaries": [ { $group: { _id: "$salaryRange" } } ],
          "locations": [ { $group: { _id: "$location" } } ],
          "categories": [ { $group: { _id: "$category" } } ],
          "ownerIds": [ { $group: { _id: "$postedBy" } } ]
        }
      },
      {
        $project: {
          skills: { $map: { input: "$skills", as: "s", in: "$$s._id" } },
          experience: { $map: { input: "$experience", as: "e", in: "$$e._id" } },
          jobType: { $map: { input: "$jobTypes", as: "j", in: "$$j._id" } },
          roles: { $map: { input: "$roles", as: "r", in: "$$r._id" } },
          salary: { $map: { input: "$salaries", as: "sal", in: "$$sal._id" } },
          location: { $map: { input: "$locations", as: "l", in: "$$l._id" } },
          category: { $map: { input: "$categories", as: "c", in: "$$c._id" } },
          ownerIds: { $map: { input: "$ownerIds", as: "o", in: "$$o._id" } }
        }
      }
    ]);

    const result = requirements[0];

    // 2. Fetch Authority details (Optimized: only if ownerIds exist)
    let uniqueOwners = [];
    if (result.ownerIds?.length > 0) {
      uniqueOwners = await Authority.find({
        _id: { $in: result.ownerIds }
      }).select("companyName industry _id companyLogo").lean();
    }

    return res.status(200).json({
      success: true,
      message: "Filter requirements fetched successfully",
      categories: {
        ...result,
        owners: uniqueOwners
      }
    });

  } catch (error) {
    console.error("❌ Aggregation Error in getAllRequirements:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

 const updateApplicationStatus = async (req, res) => {
    try {
        const { applicantId } = req.params;
        const { status, feedback } = req.body; // e.g., 'Shortlisted', 'Rejected', 'Interview'

        const validStatuses = ['Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Offered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status update" });
        }

        // 1. Update the Applicant record
        const applicant = await Applicant.findByIdAndUpdate(
            applicantId,
            { $set: { status, feedback } },
            { new: true }
        ).populate("jobId seekerId");

        if (!applicant) {
            return res.status(404).json({ success: false, message: "Application record not found" });
        }

        // 2. DUAL-SIDE NOTIFICATION: Notify the Seeker of the result
        const seekerUserId = applicant.seekerId.userId; 
        
        sendNotification({
            recipientId: seekerUserId,
            title: `Application Update: ${status} 📢`,
            subject: `Your application for ${applicant.jobId.jobRole} has been marked as ${status}.`,
            type: "status_change",
            metaData: {
                applicationId: applicantId,
                status: status,
                jobTitle: applicant.jobId.jobRole,
                feedback: feedback || ""
            }
        }).catch(err => console.error("Seeker status notification failed", err));

        return res.status(200).json({
            success: true,
            message: `Applicant status updated to ${status}`,
            applicant
        });

    } catch (error) {
        console.error("Update Status Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getApplicantsByJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        const applicants = await Applicant.find({ jobId })
            .populate({
                path: "seekerId",
                select: "skills experience resume",
                populate: { path: "userId", select: "firstName lastName picture email" }
            })
            .sort({ createdAt: -1 })
            .lean();

        if (!applicants || applicants.length === 0) {
            return res.status(200).json({ success: true, message: "No applicants yet", applicants: [] });
        }

        // Optional: Add a "Match Score" calculation for the UI Card here
        const enhancedApplicants = applicants.map(app => ({
            ...app,
            matchScore: 85 // You can call your match calculation utility here
        }));

        return res.status(200).json({
            success: true,
            message: "Applicants retrieved for review",
            applicants: enhancedApplicants
        });

    } catch (error) {
        console.error("Get Applicants Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getSimilarJobs = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId);

        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        const similarJobs = await Job.find({
            category: job.category,
            _id: { $ne: jobId }, // Don't include the current job
            status: "Active"
        })
        .limit(4)
        .select("title location salaryRange jobType companyId")
        .populate("companyId", "companyName companyLogo");

        return res.status(200).json({
            success: true,
            jobs: similarJobs
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching similar jobs" });
    }
};

const toggleJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status } = req.body; // Expecting: 'Active', 'Paused', or 'Closed'

        // 1. Validation
        const validStatuses = ['Active', 'Paused', 'Closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status. Must be 'Active', 'Paused', or 'Closed'." 
            });
        }

        // 2. Find and Update
        // We use { runValidators: true } to ensure the new status matches our Schema enum
        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            { $set: { status: status } },
            { new: true, runValidators: true }
        );

        if (!updatedJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // 3. Logic for 'Closed' jobs
        // If a job is closed, we might want to notify pending applicants 
        // that the position is no longer accepting applications.
        if (status === 'Closed') {
            // Optional: You could trigger a bulk notification utility here
            // notifyPendingApplicants(jobId);
        }

        return res.status(200).json({
            success: true,
            message: `Job status successfully updated to ${status}`,
            job: updatedJob
        });

    } catch (error) {
        console.error("Error in toggleJobStatus:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export {createJob,getAllJobs,getJobById,removeJob,getAllJobsByAuthorityId,applyForJob,saveJob,getSavedJobBySeekerId,getCustomizedJobs,getAllRequirements,updateApplicationStatus,getApplicantsByJob,getSimilarJobs,toggleJobStatus}
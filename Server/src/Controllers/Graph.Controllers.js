import Seeker from "../Models/Seeker.Models.js";
import Applicant from "../Models/Applicant.Models.js";
import User from "../Models/User.Models.js";
import Job from "../Models/Job.Models.js";
import Authority from "../Models/Authority.Models.js";

// --- SEEKER GRAPH HELPERS ---

const getApplicationStatus = async (req, res) => {
  try {
    // Identity extracted from Cookie (req.user)
    const seekerId = req.user.seekerProfile;

    const seeker = await Seeker.findById(seekerId);
    if (!seeker) return res.status(404).json({ success: false, message: "Seeker profile not found." });

    const applied = seeker.appliedFor?.length || 0;
    const viewed = seeker.savedJobs?.length || 0;
    const rejected = seeker.rejectedApplications?.length || 0;
    const offered = seeker.offeredJobs?.length || 0;

    return res.status(200).json({
      success: true,
      data: { Applied: applied, Viewed: viewed, Rejected: rejected, Offered: offered },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApplicationStatusByDate = async (req, res) => {
  try {
    const seekerId = req.user.seekerProfile;

    const applicants = await Applicant.find({ seekerId });
    if (!applicants.length) return res.status(200).json({ success: true, data: [] });

    const dateCounts = {};
    applicants.forEach((item) => {
      const date = new Date(item.appliedAt).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const result = Object.entries(dateCounts).map(([date, count]) => ({ date, count }));
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApplicationStatusByJobCategory = async (req, res) => {
  try {
    const seekerId = req.user.seekerProfile;
    const seeker = await Seeker.findById(seekerId);
    if (!seeker) return res.status(404).json({ success: false, message: "Seeker not found." });

    const jobIds = seeker.appliedFor.map(item => item.job || item);
    const jobs = await Job.find({ _id: { $in: jobIds } }).select("category");

    const categoryCounts = {};
    jobs.forEach((job) => {
      if (!job.category) return;
      categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
    });

    const result = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApplicationStatusByJobLocation = async (req, res) => {
  try {
    const seekerId = req.user.seekerProfile;
    const seeker = await Seeker.findById(seekerId);
    if (!seeker) return res.status(404).json({ success: false, message: "Seeker not found." });

    const jobIds = seeker.appliedFor.map(item => item.job || item);
    const jobs = await Job.find({ _id: { $in: jobIds } }).select("location");

    const locationCounts = {};
    jobs.forEach((job) => {
      if (!job.location) return;
      locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
    });

    const result = Object.entries(locationCounts).map(([location, count]) => ({ location, count }));
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfileGrade = async (req, res) => {
  try {
    const seekerId = req.user.seekerProfile;
    const seeker = await Seeker.findById(seekerId);
    if (!seeker) return res.status(404).json({ success: false, message: "Seeker not found." });

    // Assuming calculateProfileCompletion is imported or defined globally
    const { score, brief } = await calculateProfileCompletion(seeker);
    return res.status(200).json({ success: true, data: score, brief });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- AUTHORITY (EMPLOYER) GRAPH HELPERS ---

const getApplicationCountPerJob = async (req, res) => {
  try {
    const authId = req.user.authorityProfile;
    const authority = await Authority.findById(authId).populate("jobs", "title applicants");
    if (!authority) return res.status(404).json({ success: false, message: "Authority profile not found" });

    const results = authority.jobs.map(job => ({
      title: job.title,
      count: job.applicants?.length || 0
    }));

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWeeklyApplicationStats = async (req, res) => {
  try {
    const authId = req.user.authorityProfile;
    const authority = await Authority.findById(authId).select("jobs");
    if (!authority) return res.status(404).json({ success: false, message: "Authority not found." });
    
    const allApplicants = await Applicant.find({ jobId: { $in: authority.jobs } }).select("appliedAt");

    const dateCounts = {};
    allApplicants.forEach((item) => {
      const date = new Date(item.appliedAt).toISOString().split("T")[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const result = Object.entries(dateCounts).map(([date, count]) => ({ date, count }));
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllApplicantStatus = async (req, res) => {
  try {
    const authId = req.user.authorityProfile;
    const authority = await Authority.findById(authId);
    if (!authority) return res.status(404).json({ success: false, message: "Authority not found." });

    return res.json({
      success: true,
      data: {
        viewed: authority.SeekersToReview?.length || 0,
        shortlisted: authority.shortlistedSeekers?.length || 0,
        rejected: authority.rejectedSeekers?.length || 0,
        hired: authority.hiredSeekers?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getApplicationsByLocations = async (req, res) => {
  try {
    const authId = req.user.authorityProfile;
    const authority = await Authority.findById(authId).select("jobs");
    const jobs = await Job.find({ _id: { $in: authority.jobs } }).select("location _id");

    const locationCounts = {};
    for (const job of jobs) {
      const applicantsCount = await Applicant.countDocuments({ jobId: job._id });
      locationCounts[job.location] = (locationCounts[job.location] || 0) + applicantsCount;
    }

    const result = Object.entries(locationCounts).map(([location, count]) => ({ location, count }));
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApplicationsByJobRole = async (req, res) => {
  try {
    const authId = req.user.authorityProfile;
    const authority = await Authority.findById(authId).select("jobs");
    const jobs = await Job.find({ _id: { $in: authority.jobs } }).select("jobRole");

    const roleCounts = {};
    for (const job of jobs) {
      const count = await Applicant.countDocuments({ jobId: job._id });
      roleCounts[job.jobRole] = (roleCounts[job.jobRole] || 0) + count;
    }

    const result = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApplicationsByJobType = async (req, res) => {
  try {
    const authId = req.user.authorityProfile;
    const authority = await Authority.findById(authId).select("jobs");
    const jobs = await Job.find({ _id: { $in: authority.jobs } }).select("jobType");

    const typeCounts = {};
    for (const job of jobs) {
      const count = await Applicant.countDocuments({ jobId: job._id });
      typeCounts[job.jobType] = (typeCounts[job.jobType] || 0) + count;
    }

    const result = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApplicationsByJobCategory = async (req, res) => {
  try {
    const authId = req.user.authorityProfile;
    const authority = await Authority.findById(authId).select("jobs");
    const jobs = await Job.find({ _id: { $in: authority.jobs } }).select("category");

    const categoryCounts = {};
    for (const job of jobs) {
      const count = await Applicant.countDocuments({ jobId: job._id });
      categoryCounts[job.category] = (categoryCounts[job.category] || 0) + count;
    }

    const result = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getApplicationStatus,
  getApplicationStatusByDate,
  getApplicationStatusByJobCategory,
  getApplicationStatusByJobLocation,
  getProfileGrade,
  getApplicationCountPerJob,
  getWeeklyApplicationStats,
  getAllApplicantStatus,
  getApplicationsByLocations,
  getApplicationsByJobRole,
  getApplicationsByJobCategory,
  getApplicationsByJobType
};
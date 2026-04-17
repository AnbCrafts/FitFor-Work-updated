import Seeker from "../Models/Seeker.Models.js";
import Job from "../Models/Job.Models.js";

const getSuggestedJobsForSeeker = async (req, res) => {
  try {
    // resolveIdentity middleware has already verified this is a valid ObjectId
    const { seekerId } = req.params;

    // 1. Fetch Seeker Profile
    const seeker = await Seeker.findById(seekerId)
      .select("skills preferredLocation preferredJobType experience desiredPost appliedFor")
      .lean();

    if (!seeker) {
      return res.status(404).json({ 
        success: false, 
        message: "Professional profile not found." 
      });
    }

    // 2. Build Smart Recommendation Query
    // We look for Active jobs, excluding those the user already applied to
    const query = {
      status: "Active",
      _id: { $nin: seeker.appliedFor || [] },
      $or: [
        { location: { $regex: seeker.preferredLocation || "", $options: "i" } },
        { jobType: seeker.preferredJobType },
        { jobRole: { $regex: seeker.desiredPost || "", $options: "i" } },
        { skillsRequired: { $in: seeker.skills || [] } }
      ]
    };

    // 3. Fetch with Population
    // populate('postedBy') connects to the Authority model for branding
    const suggestedJobs = await Job.find(query)
      .select("title jobRole location jobType salaryRange companyLogo companyId createdAt")
      .populate("companyId", "companyName picture industry") // Ensure this matches your field name in Job model
      .limit(15)
      .sort({ createdAt: -1 })
      .lean();

    // 4. Response
    return res.status(200).json({
      success: true,
      totalMatches: suggestedJobs.length,
      suggestedJobs, 
    });

  } catch (error) {
    console.error("Error in getSuggestedJobsForSeeker:", error.message);
    return res.status(500).json({ 
        success: false, 
        message: "Failed to fetch job suggestions." 
    });
  }
};

export { getSuggestedJobsForSeeker };

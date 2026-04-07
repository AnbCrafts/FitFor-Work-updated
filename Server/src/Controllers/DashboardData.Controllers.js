import Seeker from "../Models/Seeker.Models.js";
import Job from "../Models/Job.Models.js";

const getSuggestedJobsForSeeker = async (req, res) => {
  try {
    const { seekerId } = req.params;

    if (!seekerId) {
      return res.status(400).json({ success: false, message: "Seeker ID is required." });
    }

    // 1. Fetch Seeker and their "Exclusion List" (Already Applied)
    const seeker = await Seeker.findById(seekerId).select("skills preferredLocation preferredJobType experience desiredPost appliedFor");
    if (!seeker) {
      return res.status(404).json({ success: false, message: "Seeker not found." });
    }

    // 2. Build the Recommendation Query
    const query = {
      status: "Active", // Matches your 'toggleJobStatus' naming
      _id: { $nin: seeker.appliedFor || [] }, // Don't show jobs already applied to
      $or: [
        { location: { $regex: seeker.preferredLocation || "", $options: "i" } },
        { jobType: seeker.preferredJobType },
        { jobRole: { $regex: seeker.desiredPost || "", $options: "i" } },
        { skillsRequired: { $in: seeker.skills || [] } }
      ]
    };

    // 3. Fetch with Authority Branding for UI Cards
    const suggestedJobs = await Job.find(query)
      .select("title jobRole location jobType salaryRange companyLogo companyId createdAt")
      .populate("postedBy", "companyName companyLogo industry") // Critical for the UI Card
      .limit(20)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      totalMatches: suggestedJobs.length,
      suggestedJobs, // Now contains everything needed for a rich UI card
    });

  } catch (error) {
    console.error("Error in getSuggestedJobsForSeeker:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export { getSuggestedJobsForSeeker };

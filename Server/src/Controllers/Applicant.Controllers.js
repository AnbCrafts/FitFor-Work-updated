import Applicant from "../Models/Applicant.Models.js";
import Authority from "../Models/Authority.Models.js";
import Employee from "../Models/Employee.Models.js";
import Job from "../Models/Job.Models.js";
import Seeker from "../Models/Seeker.Models.js";
import User from "../Models/User.Models.js";


const getAllApplicant = async (req, res) => {
  try {
    const applicants = await Applicant.find({});
    
    if (!applicants || applicants.length === 0) {
      return res.json({ success: false, message: "No Applicants found" });
    }

    // Enrich each applicant with related data
    const enrichedApplicants = await Promise.all(applicants.map(async (item) => {
      const seeker = await Seeker.findById(item.seekerId);
      const user = seeker ? await User.findById(seeker.userId) : null;
      const job = await Job.findById(item.jobId);
      const authority = await Authority.findById(item.companyId);

      return {
        ...item.toObject(), 
        seeker,
        user,
        job,
        authority
      };
    }));

    return res.json({
      success: true,
      message: "All Applicants found",
      applicants: enrichedApplicants
    });

  } catch (error) {
    console.error("Error in getAllApplicant:", error);
    return res.json({ success: false, message: "Something went wrong" });
  }
};

const getApplicantById = async (req,res)=>{
            try {
                const {applicantId} = req.params;
                if(!applicantId){
                    return res.json({success:false,message:"Applicant Id not found"})

                }
                const applicant = await Applicant.findById(applicantId);
                if(!applicant){
                    return res.json({success:false,message:"No Applicant found for this id"})
                }

                return res.json({success:true,message:"All Applicants found", applicant})

                
            } catch (error) {
               console.log(error);
               return res.json({success:false,message:"SOmething error occurred"})
            }
}
const acceptApplicant = async (req, res) => {
  try {
    const { applicantId, jobId } = req.params;

    if (!applicantId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Applicant ID and Job ID are required"
      });
    }

    const applicant = await Applicant.findById(applicantId).populate("seekerId jobId companyId");
    if (!applicant) {
      return res.status(404).json({ success: false, message: "Applicant not found" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.totalSeats <= 0) {
      return res.status(400).json({ success: false, message: "No seats left for this job" });
    }

    job.totalSeats -= 1;
    

    applicant.status = "Accepted";


    await job.save();
    await applicant.save();

    const newEmployee = new Employee({
      seekerId: applicant.seekerId, 
      jobId: jobId,
      companyId: applicant.companyId,
      joinedOn: new Date(),
      jobType: job.jobType,
      currentPost: job.title 
    });

    await newEmployee.save();


    await Authority.findByIdAndUpdate(applicant.companyId, {
      $push: { hiredSeekers: newEmployee._id },
      $pull: { SeekersToReview: applicantId }
    });
    await Job.findByIdAndUpdate(jobId, {
      $push: { employees: newEmployee._id },
      $pull: { applicants: applicantId }
    });

    job.save();


    

    return res.status(200).json({
      success: true,
      message: "Applicant accepted and added as employee",
      employeeId: newEmployee._id
    });

  } catch (error) {
    console.log("Error in acceptApplicant:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}; 
const rejectApplicant = async (req, res) => {
  try {
    const { applicantId, jobId } = req.params;

    if (!applicantId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Applicant ID and Job ID are required"
      });
    }

    const applicant = await Applicant.findById(applicantId).populate("seekerId jobId companyId");
    if (!applicant) {
      return res.status(404).json({ success: false, message: "Applicant not found" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Update status
    applicant.status = "Rejected";
    await applicant.save();

    // Remove from review list
    await Authority.findByIdAndUpdate(applicant.companyId, {
      $pull: { SeekersToReview: applicant._id }
    });

    // Optional: Also remove from job's applicant list if maintained
    await Job.findByIdAndUpdate(jobId, {
      $pull: { applicants: applicant._id }
    });

    return res.status(200).json({
      success: true,
      message: "Applicant rejected successfully",
    });

  } catch (error) {
    console.log("Error in rejectApplicant:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const getApplicantFromSeekerId = async(req,res)=>{
      try {
        const {seekerId} = req.params;
        if(!seekerId){
        return res.json({success:false,message:"Cannot get seekerId"})
        }

        const applicant = await Applicant.find({seekerId:seekerId});
        if(!applicant ){
        return res.json({success:false,message:"Cannot get applicants for this seekerId"})

        }
        return res.json({success:true,message:"Got the applicants for this seekerId", applicant})

        
      } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Internal Sever Error"})
      }
}
const getApplicantFromJobId = async(req,res)=>{
      try {
        const {jobId} = req.params;
        if(!jobId){
        return res.json({success:false,message:"Cannot get Job ID"})
        }

        const applicants = await Applicant.find({jobId:jobId});
        if(!applicants || applicants.length<0){
        return res.json({success:false,message:"Cannot get applicants for this JOB ID"})

        }
        return res.json({success:true,message:"Got the applicants for this JOB ID", applicants})

        
      } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Internal Sever Error"})
      }
}
const getApplicantFromCompanyId = async(req,res)=>{
      try {
        const {companyId} = req.params;
        if(!companyId){
        return res.json({success:false,message:"Cannot get companyId"})
        }

        const applicants = await Applicant.find({companyId:companyId});
        if(!applicants || applicants.length<0){
        return res.json({success:false,message:"Cannot get applicants for this companyId"})

        }
        return res.json({success:true,message:"Got the applicants for this companyId", applicants})

        
      } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Internal Sever Error"})
      }
}
const getApplicantFromCompanyIdAndJobId = async(req,res)=>{
      try {
        const {companyId,jobId} = req.params;
        if(!companyId){
        return res.json({success:false,message:"Cannot get companyId"})
        }
        if(!jobId){
        return res.json({success:false,message:"Cannot get Job ID"})
        }

        const applicant = await Applicant.findOne({companyId:companyId, jobId:jobId});
        if(!applicant){
        return res.json({success:false,message:"Cannot get applicants for this companyId and job Id"})

        }
        return res.json({success:true,message:"Got the applicants for this companyId and job id", applicant})

        
      } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Internal Sever Error"})
      }
}
const applicantData = async (applicantID) => {
  if (!applicantID) {
    return "Provide ApplicantID";
  }

  const applicant = await Applicant.findById(applicantID);
  if (!applicant) {
    return "Cannot find Applicant";
  }

  const seeker = await Seeker.findById(applicant.seekerId);
  if (!seeker) {
    return "Cannot find Seeker";
  }

  return {
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
    achievements: seeker.achievements
  };
};
const getApplicantDATAFromCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.json({ success: false, message: "Cannot get company ID" });
    }

    const company = await Authority.findOne({ owner: companyId });
    if (!company) {
      return res.json({ success: false, message: "Cannot get company for this ID" });
    }

    const seekersToReview = company.SeekersToReview || [];

    const allApplicantData = await Promise.all(
      seekersToReview.map((id) => applicantData(id))
    );

    const validData = allApplicantData.filter((d) => typeof d === "object");

    if (validData.length <= 0) {
      return res.json({ success: false, message: "Cannot get DATA" });
    }

    return res.json({
      success: true,
      message: "Got all the seekers data",
      allApplicantData: validData,
      // company,

    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

 

export {getAllApplicant, getApplicantById,rejectApplicant,acceptApplicant,getApplicantFromJobId,getApplicantFromCompanyId,getApplicantFromCompanyIdAndJobId,getApplicantFromSeekerId,getApplicantDATAFromCompanyId}
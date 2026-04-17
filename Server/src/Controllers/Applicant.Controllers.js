import Applicant from "../Models/Applicant.Models.js";
import Authority from "../Models/Authority.Models.js";
import Employee from "../Models/Employee.Models.js";
import Job from "../Models/Job.Models.js";
import Seeker from "../Models/Seeker.Models.js";
import User from "../Models/User.Models.js";

// 1. GET ALL APPLICANTS (Admin Only Logic)
const getAllApplicant = async (req, res) => {
  try {
    const applicants = await Applicant.find({});
    if (!applicants.length) return res.json({ success: false, message: "No Applicants found" });

    const enrichedApplicants = await Promise.all(applicants.map(async (item) => {
      const seeker = await Seeker.findById(item.seekerId);
      const user = seeker ? await User.findById(seeker.userId) : null;
      const job = await Job.findById(item.jobId);
      const authority = await Authority.findById(item.companyId);

      return { ...item.toObject(), seeker, user, job, authority };
    }));

    return res.json({ success: true, applicants: enrichedApplicants });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. GET APPLICANT BY ID
const getApplicantById = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const applicant = await Applicant.findById(applicantId).populate("seekerId jobId companyId");
    if (!applicant) return res.json({ success: false, message: "Applicant not found" });

    return res.json({ success: true, applicant });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. ACCEPT APPLICANT
const acceptApplicant = async (req, res) => {
  try {
    const { applicantId, jobId } = req.params;
    const applicant = await Applicant.findById(applicantId);
    const job = await Job.findById(jobId);

    if (!applicant || !job) return res.status(404).json({ success: false, message: "Data not found" });
    if (job.totalSeats <= 0) return res.status(400).json({ success: false, message: "No seats left" });

    job.totalSeats -= 1;
    applicant.status = "Accepted";

    const newEmployee = new Employee({
      seekerId: applicant.seekerId,
      jobId,
      companyId: applicant.companyId,
      joinedOn: new Date(),
      jobType: job.jobType,
      currentPost: job.title
    });

    await Promise.all([
      job.save(),
      applicant.save(),
      newEmployee.save(),
      Authority.findByIdAndUpdate(applicant.companyId, { $push: { hiredSeekers: newEmployee._id }, $pull: { SeekersToReview: applicantId } }),
      Job.findByIdAndUpdate(jobId, { $push: { employees: newEmployee._id }, $pull: { applicants: applicantId } })
    ]);

    return res.status(200).json({ success: true, message: "Applicant accepted", employeeId: newEmployee._id });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Error" });
  }
};

// 4. REJECT APPLICANT
const rejectApplicant = async (req, res) => {
  try {
    const { applicantId, jobId } = req.params;
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found" });

    applicant.status = "Rejected";
    await applicant.save();

    await Authority.findByIdAndUpdate(applicant.companyId, { $pull: { SeekersToReview: applicant._id } });
    await Job.findByIdAndUpdate(jobId, { $pull: { applicants: applicant._id } });

    return res.json({ success: true, message: "Applicant rejected" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Error" });
  }
};

// 5. GET APPLICANT FROM SEEKER ID (Resolved 'me')
const getApplicantFromSeekerId = async (req, res) => {
  try {
    const seekerId = req.params.id; // From resolveIdentity middleware
    const applicant = await Applicant.find({ seekerId }).populate("jobId companyId");
    return res.json({ success: true, applicant });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 6. GET APPLICANT FROM JOB ID
const getApplicantFromJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applicants = await Applicant.find({ jobId }).populate("seekerId");
    return res.json({ success: true, applicants });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 7. GET APPLICANT FROM COMPANY ID (Resolved 'me')
const getApplicantFromCompanyId = async (req, res) => {
  try {
    const companyId = req.params.id; // From resolveIdentity middleware
    const applicants = await Applicant.find({ companyId }).populate("seekerId jobId");
    return res.json({ success: true, applicants });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 8. GET APPLICANT FROM COMPANY ID AND JOB ID
const getApplicantFromCompanyIdAndJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.params.id; // From resolveIdentity middleware
    const applicant = await Applicant.findOne({ companyId, jobId }).populate("seekerId");
    return res.json({ success: true, applicant });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 9. HELPER: APPLICANT DATA FORMATTER
const applicantData = async (applicantID) => {
  const applicant = await Applicant.findById(applicantID);
  if (!applicant) return null;
  const seeker = await Seeker.findById(applicant.seekerId);
  return seeker ? { id: applicant._id, ...seeker.toObject() } : null;
};

// 10. GET DETAILED APPLICANT DATA FROM COMPANY ID (Resolved 'me')
const getApplicantDATAFromCompanyId = async (req, res) => {
  try {
    const companyId = req.params.id; // From resolveIdentity middleware
    const company = await Authority.findById(companyId);
    if (!company) return res.json({ success: false, message: "Authority not found" });

    const seekersToReview = company.SeekersToReview || [];
    const allData = await Promise.all(seekersToReview.map(id => applicantData(id)));
    const validData = allData.filter(Boolean);

    return res.json({ success: true, allApplicantData: validData });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export {
  getAllApplicant,
  getApplicantById,
  rejectApplicant,
  acceptApplicant,
  getApplicantFromJobId,
  getApplicantFromCompanyId,
  getApplicantFromCompanyIdAndJobId,
  getApplicantFromSeekerId,
  getApplicantDATAFromCompanyId
};
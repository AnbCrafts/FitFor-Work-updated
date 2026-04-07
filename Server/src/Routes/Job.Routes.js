import { Router } from "express";
import { 
    applyForJob, 
    createJob, 
    getAllJobs, 
    getAllJobsByAuthorityId, 
    getAllRequirements, 
    getCustomizedJobs, 
    getJobById, 
    getSavedJobBySeekerId, 
    removeJob, 
    saveJob,
    // --- New Lifecycle & Management Controllers ---
    updateApplicationStatus,
    getApplicantsByJob,
    toggleJobStatus,
    getSimilarJobs
} from "../Controllers/Job.Controllers.js";
import { verifyJWT } from "../Middlewares/VerifyJWT.Middleware.js";
  

const JobRouter = Router(); 

// --- 1. Public Discovery (No Auth Required) ---
JobRouter.get("/list/all", getAllJobs);
JobRouter.get("/list/all/custom-query", getCustomizedJobs);
JobRouter.get("/list/all/requirements", getAllRequirements);
JobRouter.get("/list/all/:jobId", getJobById);
JobRouter.get("/list/all/similar/:jobId", getSimilarJobs);

// --- 2. Job Creation & Authority Management (Auth Required) ---
JobRouter.post("/create/new", verifyJWT, createJob);
JobRouter.get("/list/all/authority/:AuthId", getAllJobsByAuthorityId);
JobRouter.patch("/status/toggle/:jobId", verifyJWT, toggleJobStatus); // Close/Pause jobs
JobRouter.delete("/list/all/:jobId/remove", verifyJWT, removeJob);

// --- 3. Seeker Interactions (Auth Required) ---
// Note: verifyJWT ensures 'req.user' exists for dual-side notifications
JobRouter.post("/apply/:jobId/:seekerId", verifyJWT, applyForJob); 
JobRouter.put("/save/:jobId/:seekerId", verifyJWT, saveJob); 
JobRouter.get("/applicant/:seekerId/saved-list/all", verifyJWT, getSavedJobBySeekerId);

// --- 4. Applicant Review (Employer Focused - Auth Required) ---
// These power the "Persistent Cards" in the Employer's Review Queue
JobRouter.get("/applicants/review/:jobId", verifyJWT, getApplicantsByJob); 
JobRouter.patch("/applicant/decision/:applicantId", verifyJWT, updateApplicationStatus);

export default JobRouter;
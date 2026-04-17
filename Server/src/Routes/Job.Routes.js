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
    updateApplicationStatus,
    getApplicantsByJob,
    toggleJobStatus,
    getSimilarJobs,
    getJobCategories
} from "../Controllers/Job.Controllers.js";
import { verifyJWT } from "../Middlewares/VerifyJWT.Middleware.js";
import { authorizeRoles } from "../Middlewares/RoleAuthorisation.Middleware.js";

const JobRouter = Router(); 

// --- 1. Public Discovery (No Auth Required) ---
JobRouter.get("/list/all", getAllJobs);
JobRouter.get("/list/all/custom-query", getCustomizedJobs);
JobRouter.get("/list/all/requirements", getAllRequirements);
JobRouter.get("/list/all/:jobId", getJobById);
JobRouter.get("/list/all/similar/:jobId", getSimilarJobs);
JobRouter.get("/categories", getJobCategories);

// --- 2. Job Creation & Authority Management (Auth Required) ---
// Identity pulled from req.user.authorityProfile
JobRouter.post("/create/new", verifyJWT,authorizeRoles("Authority"), createJob);
JobRouter.get("/my-listings", verifyJWT, getAllJobsByAuthorityId); // Replacement for authority/:AuthId
JobRouter.patch("/status/toggle/:jobId", verifyJWT,authorizeRoles("Authority"), toggleJobStatus); 
JobRouter.delete("/remove/:jobId", verifyJWT, removeJob);

// --- 3. Seeker Interactions (Auth Required) ---
// Identity pulled from req.user.seekerProfile
// You don't need resolveIdentity here because the controller pulls seekerId from req.user
JobRouter.post("/apply/:jobId", verifyJWT, authorizeRoles("Seeker"), applyForJob); // Removed seekerId
JobRouter.put("/save/:jobId", verifyJWT,authorizeRoles("Seeker"), saveJob);       // Removed seekerId
JobRouter.get("/saved-list", verifyJWT, getSavedJobBySeekerId); // Removed seekerId

// --- 4. Applicant Review (Employer Focused - Auth Required) ---
JobRouter.get("/review/:jobId/applicants", verifyJWT, getApplicantsByJob); 
JobRouter.patch("/applicant/decision/:applicantId", verifyJWT, updateApplicationStatus);

export default JobRouter;
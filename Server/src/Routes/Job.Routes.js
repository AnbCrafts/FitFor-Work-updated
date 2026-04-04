import { Router } from "express";
import { applyForJob, createJob, getAllJobs, getAllJobsByAuthorityId, getAllRequirements, getCustomizedJobs, getJobById, getSavedJobBySeekerId, removeJob, saveJob } from "../Controllers/Job.Controllers.js";
import Job from "../Models/Job.Models.js";

const JobRouter = Router(); 

 
JobRouter.post("/create/new",createJob)  
JobRouter.get("/list/all",getAllJobs)
JobRouter.get("/list/all/custom-query",getCustomizedJobs)
JobRouter.get("/list/all/requirements",getAllRequirements)
JobRouter.get("/list/all/:jobId",getJobById)
JobRouter.delete("/list/all/:jobId/remove",removeJob)
JobRouter.get("/list/all/authority/:AuthId",getAllJobsByAuthorityId)
JobRouter.post("/:jobId/applicant/:seekerId/apply",applyForJob)   
JobRouter.put("/:jobId/applicant/:seekerId/save",saveJob)   
JobRouter.get("/applicant/:seekerId/saved-list/all",getSavedJobBySeekerId)  
  
export default JobRouter 
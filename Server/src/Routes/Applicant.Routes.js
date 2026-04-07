import { Router } from "express";
import { acceptApplicant, getAllApplicant, getApplicantById, getApplicantDATAFromCompanyId, getApplicantFromCompanyId, getApplicantFromCompanyIdAndJobId, getApplicantFromJobId, getApplicantFromSeekerId, rejectApplicant } from "../Controllers/Applicant.Controllers.js";



const ApplicantRouter =  Router();  
 
ApplicantRouter.post("/list/all/applicant/:applicantId/job/:jobId/accept",acceptApplicant)
ApplicantRouter.post("/list/all/applicant/:applicantId/job/:jobId/reject",rejectApplicant)
ApplicantRouter.get("/list/all",getAllApplicant) 
ApplicantRouter.get("/list/all/:applicantId",getApplicantById)
ApplicantRouter.get("/list/all/job/:jobId",getApplicantFromJobId)
ApplicantRouter.get("/list/all/seeker/:seekerId",getApplicantFromSeekerId)
ApplicantRouter.get("/list/all/company/:companyId",getApplicantFromCompanyId)
ApplicantRouter.get("/list/all/company/:companyId/data",getApplicantDATAFromCompanyId)
ApplicantRouter.get("/list/all/company/:companyId/job/:jobId",getApplicantFromCompanyIdAndJobId)

 
export default ApplicantRouter;
import { Router } from "express";
import { 
  getAllApplicantStatus, 
  getApplicationCountPerJob, 
  getApplicationsByJobCategory, 
  getApplicationsByJobRole, 
  getApplicationsByJobType, 
  getApplicationsByLocations, 
  getApplicationStatus, 
  getApplicationStatusByDate, 
  getApplicationStatusByJobCategory, 
  getApplicationStatusByJobLocation, 
  getProfileGrade, 
  getWeeklyApplicationStats 
} from "../Controllers/Graph.Controllers.js";
import { verifyJWT } from "../Middlewares/VerifyJWT.Middleware.js";

const GraphRouter = Router(); 

/** * --- SEEKER ANALYTICS --- 
 * No params needed. Identity is pulled from req.user (via Cookie)
 */
GraphRouter.get('/seeker/status', verifyJWT, getApplicationStatus);
GraphRouter.get('/seeker/status/date', verifyJWT, getApplicationStatusByDate);
GraphRouter.get('/seeker/status/category', verifyJWT, getApplicationStatusByJobCategory);
GraphRouter.get('/seeker/status/location', verifyJWT, getApplicationStatusByJobLocation);
GraphRouter.get('/seeker/profile-grade', verifyJWT, getProfileGrade);


/** * --- AUTHORITY ANALYTICS --- 
 * No params needed. Identity is pulled from req.user (via Cookie)
 */
GraphRouter.get('/authority/count', verifyJWT, getApplicationCountPerJob);
GraphRouter.get('/authority/count/weekly', verifyJWT, getWeeklyApplicationStats);
GraphRouter.get('/authority/count/status', verifyJWT, getAllApplicantStatus);
GraphRouter.get('/authority/count/location', verifyJWT, getApplicationsByLocations);
GraphRouter.get('/authority/count/role', verifyJWT, getApplicationsByJobRole);
GraphRouter.get('/authority/count/type', verifyJWT, getApplicationsByJobType);
GraphRouter.get('/authority/count/category', verifyJWT, getApplicationsByJobCategory);


export default GraphRouter;
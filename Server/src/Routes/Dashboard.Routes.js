import { Router } from "express";
import { getSuggestedJobsForSeeker } from "../Controllers/DashboardData.Controllers.js";
import { verifyJWT } from "../Middlewares/VerifyJWT.Middleware.js";
import { resolveIdentity } from "../Middlewares/ResolveIdentity.Middleware.js";


const DashboardRouter = Router();

DashboardRouter.get("/suggested-jobs/me",verifyJWT,resolveIdentity,getSuggestedJobsForSeeker)


export default DashboardRouter;

import { Router } from "express";
import upload from "../Middlewares/Multer.Middleware.js";
import multer from "multer";
import { createProfile, editProfile, getAllFactors, getAllSeekers, getCustomSeekers, getMatchingJobs, getSeekerById, getSeekerByUserId, getUserDashboardData, getWantedAuthorities, removeSeeker } from "../Controllers/Seeker.Controllers.js";
import uploadResume from "../Middlewares/ResumeMulter.Middleware.js";

 
const SeekerRouter = Router(); 
 
SeekerRouter.post('/profile/create', uploadResume.single('resume'),createProfile);
SeekerRouter.get('/profile/list/all',getAllSeekers);
SeekerRouter.get('/profile/list/all/factors',getAllFactors);
SeekerRouter.get('/profile/list/all/factors/custom-query',getCustomSeekers);
SeekerRouter.get('/profile/list/all/:seekerId',getSeekerById);
SeekerRouter.get('/profile/list/all/user/:userId',getSeekerByUserId);
SeekerRouter.delete('/profile/list/all/:seekerId/remove',removeSeeker);
SeekerRouter.get('/profile/list/all/:seekerId/jobs/matching', getMatchingJobs);
SeekerRouter.get('/profile/list/all/:seekerId/authorities/matching', getWantedAuthorities);
SeekerRouter.put('/profile/list/all/:seekerId/edit', editProfile);
SeekerRouter.get('/profile/list/all/:seekerId/dashboard-data', getUserDashboardData);



export default SeekerRouter;  
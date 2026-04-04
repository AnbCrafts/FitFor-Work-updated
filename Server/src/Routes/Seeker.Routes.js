import { Router } from "express";
import { 
    createProfile, 
    editProfile, 
    getAllFactors, 
    getAllSeekers, 
    getCustomSeekers, 
    getMatchingJobs, 
    getSeekerById, 
    getSeekerByUserId, 
    getUserDashboardData, 
    getWantedAuthorities, 
    removeSeeker,
    toggleSaveJob,
    getAppliedApplications,
    updateResume,
    getApplicationDetails,
    getSavedJobs,
    
} from "../Controllers/Seeker.Controllers.js";
import uploadResume from "../Middlewares/ResumeMulter.Middleware.js";
import { verifyJWT } from "../Middlewares/VerifyJWT.Middleware.js";

const SeekerRouter = Router(); 

// --- 1. Profile Management (Protected) ---
// Note: We use verifyJWT to ensure the user is logged in
SeekerRouter.post('/profile/create', verifyJWT, uploadResume.single('resume'), createProfile);
SeekerRouter.patch('/profile/edit/:seekerId', verifyJWT, editProfile);
SeekerRouter.patch('/profile/resume-update', verifyJWT, uploadResume.single('resume'), updateResume);
SeekerRouter.get('/profile/me', verifyJWT, getSeekerByUserId); // Fetching own profile
SeekerRouter.get('/dashboard/:seekerId', verifyJWT, getUserDashboardData);

// --- 2. Discovery & Search (Public/Auth) ---
SeekerRouter.get('/all', getAllSeekers);
SeekerRouter.get('/factors', getAllFactors);
SeekerRouter.get('/search', getCustomSeekers); // Better name than 'custom-query'
SeekerRouter.get('/details/:seekerId', getSeekerById);

// --- 3. Recommendations & AI (Protected) ---
SeekerRouter.get('/jobs/matching/:seekerId', verifyJWT, getMatchingJobs);
SeekerRouter.get('/authorities/matching/:seekerId', verifyJWT, getWantedAuthorities);
// SeekerRouter.get('/resume/analyze', verifyJWT, analyzeResumeAI);

// --- 4. Interactions & Tracking (Protected) ---
SeekerRouter.patch('/jobs/save/:jobId', verifyJWT, toggleSaveJob);
SeekerRouter.get('/jobs/saved', verifyJWT, getSavedJobs);
SeekerRouter.get('/applications', verifyJWT, getAppliedApplications);
SeekerRouter.get('/applications/:id', verifyJWT, getApplicationDetails);

// --- 5. Admin Level (Protected) ---
SeekerRouter.delete('/remove/:seekerId', verifyJWT, removeSeeker);

export default SeekerRouter;
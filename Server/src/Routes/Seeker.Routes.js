import { Router } from "express";
import { 
    createProfile, 
    editProfile, 
    getAllFactors, 
    getAllSeekers, 
    getCustomSeekers, 
    getMatchingJobs, 
    getSeekerById, 
    getSeekerProfile, 
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
import { resolveIdentity } from "../Middlewares/ResolveIdentity.Middleware.js";

const SeekerRouter = Router(); 

// --- 1. Profile Management (Protected) ---
// Note: verifyJWT extracts the user, resolveIdentity ensures we target the right seeker profile
SeekerRouter.post('/profile/create', verifyJWT, uploadResume.single('resume'), createProfile);
SeekerRouter.patch('/profile/edit/:id', verifyJWT, resolveIdentity, editProfile);
SeekerRouter.patch('/profile/resume-update', verifyJWT, uploadResume.single('resume'), updateResume);
SeekerRouter.get('/profile/me', verifyJWT, getSeekerProfile); 
SeekerRouter.get('/dashboard/:id', verifyJWT, resolveIdentity, getUserDashboardData);

// --- 2. Discovery & Search (Public/Auth) ---
SeekerRouter.get('/all', getAllSeekers);
SeekerRouter.get('/factors', getAllFactors);
SeekerRouter.get('/search', getCustomSeekers); 
SeekerRouter.get('/details/:seekerId', getSeekerById); // Keeping seekerId for public viewing of others

// --- 3. Recommendations & AI (Protected) ---
// Now frontend calls: /seeker/jobs/matching/me
SeekerRouter.get('/jobs/matching/:id', verifyJWT, resolveIdentity, getMatchingJobs);
SeekerRouter.get('/authorities/matching/:id', verifyJWT, resolveIdentity, getWantedAuthorities);

// --- 4. Interactions & Tracking (Protected) ---
SeekerRouter.patch('/jobs/save/:jobId', verifyJWT, toggleSaveJob);
SeekerRouter.get('/jobs/saved', verifyJWT, getSavedJobs);
SeekerRouter.get('/applications', verifyJWT, getAppliedApplications);
SeekerRouter.get('/applications/:id', verifyJWT, getApplicationDetails);

// --- 5. Admin/Account Management (Protected) ---
SeekerRouter.delete('/remove/:id', verifyJWT, resolveIdentity, removeSeeker);

export default SeekerRouter;
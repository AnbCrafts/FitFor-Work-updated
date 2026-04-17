import { Router } from "express";
import { 
  getAllCompanies, 
  getCompaniesById, 
  getCompanyByOwner, 
  registerCompany, 
  removeCompany,
  getMatchingSeekers, 
  editProfile, 
  updateAuthoritiesPreferredSkills, 
  getAllCompanyNames 
} from "../Controllers/Authority.Controllers.js";
import upload from "../Middlewares/Multer.Middleware.js";
import { verifyJWT } from "../Middlewares/VerifyJWT.Middleware.js";
import { resolveIdentity } from "../Middlewares/ResolveIdentity.Middleware.js";

const AuthorityRouter = Router();

// --- 1. Registration (Authenticated) ---
AuthorityRouter.post('/register/new', verifyJWT, upload.single('companyLogo'), registerCompany);

// --- 2. Public / General Lists ---
AuthorityRouter.get('/list/all', getAllCompanies);
AuthorityRouter.get('/all/names', getAllCompanyNames);

// --- 3. Self-Service Routes (The "Me" Pattern) ---
// Frontend calls: /authority/profile/me/edit
AuthorityRouter.put('/profile/edit/:id', verifyJWT, resolveIdentity, editProfile); 

// Frontend calls: /authority/list/all/seekers/matching-skills/me
AuthorityRouter.get('/list/all/seekers/matching-skills/:id', verifyJWT, resolveIdentity, getMatchingSeekers);

// Frontend calls: /authority/list/all/me/remove
AuthorityRouter.delete('/list/all/:id/remove', verifyJWT, resolveIdentity, removeCompany);

// --- 4. Admin or Specific Lookups ---
AuthorityRouter.get('/list/all/:authorityId', verifyJWT, getCompaniesById);
AuthorityRouter.get('/list/all/owner/:ownerId', verifyJWT, getCompanyByOwner);
AuthorityRouter.put('/list/all/update-skills', verifyJWT, updateAuthoritiesPreferredSkills); 

export default AuthorityRouter;
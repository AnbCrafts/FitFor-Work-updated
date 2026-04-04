import { Router } from "express";
import { getAllCompanies, getCompaniesById, getCompanyByOwner, registerCompany, removeCompany,getMatchingSeekers, editProfile, updateAuthoritiesPreferredSkills, getAllCompanyNames } from "../Controllers/Authority.Controllers.js";
import upload from "../Middlewares/Multer.Middleware.js";

const AuthorityRouter = Router();
 
 
AuthorityRouter.post('/register/new', upload.single('companyLogo'),registerCompany)
AuthorityRouter.get('/list/all',getAllCompanies)
AuthorityRouter.get('/list/all/:authorityId',getCompaniesById)
AuthorityRouter.get('/list/all/owner/:ownerId',getCompanyByOwner)
AuthorityRouter.delete('/list/all/:authorityId/remove',removeCompany)
AuthorityRouter.get('/list/all/seekers/matching-skills/:authId',getMatchingSeekers)
AuthorityRouter.put('/profile/edit/:authId',editProfile) 
AuthorityRouter.put('/list/all/update-skills',updateAuthoritiesPreferredSkills) 
AuthorityRouter.get('/all/names',getAllCompanyNames) 

export default AuthorityRouter; 
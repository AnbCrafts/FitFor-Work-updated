import { Router } from "express";
import upload from "../Middlewares/Multer.Middleware.js";
import { 
    registerUser, 
    loginUser, 
    logoutUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getMe,
    updateMe,
    deactivateAccount,
    getAllUsers, 
    getUserById, 
    getUserDataBySeekerId, 
    removeUserById, 
    blockUserById,
    changePassword,
    getUserSessions,
    getPublicProfile,
} from "../Controllers/User.Controllers.js";
import { refreshAccessToken } from "../Controllers/RefreshToken.Controllers.js";
import { verifyJWT } from "../Middlewares/VerifyJWT.Middleware.js";
import { populateAdmin } from "../Middlewares/PopulateAdmin.Middleware.js";
import { checkPermission } from "../Middlewares/CheckPermissions.Middleware.js";
import { resolveIdentity } from "../Middlewares/ResolveIdentity.Middleware.js";

const UserRouter = Router(); 

// --- 1. Authentication & Verification (Public) ---
UserRouter.post('/auth/signup', upload.single('picture'), registerUser); 
UserRouter.post('/auth/login', loginUser);
UserRouter.post('/auth/refresh', refreshAccessToken);
UserRouter.post('/auth/verify-email', verifyEmail);
UserRouter.post('/auth/forgot-password', forgotPassword);
UserRouter.patch('/auth/reset-password', resetPassword);

// --- 2. Session Management (Protected) ---
UserRouter.post('/auth/logout', verifyJWT, logoutUser);
UserRouter.get('/auth/sessions', verifyJWT, getUserSessions);

// --- 3. Profile Management (Self - Implicit Identity) ---
// No params needed here because verifyJWT provides req.user
UserRouter.get('/me', verifyJWT, getMe);
UserRouter.patch('/update-me', verifyJWT, upload.single('picture'), updateMe);
UserRouter.patch('/change-password', verifyJWT, changePassword);
UserRouter.delete('/deactivate', verifyJWT, deactivateAccount);

// --- 4. Public Information (Public) ---
UserRouter.get('/profile/:username', getPublicProfile);

// --- 5. Admin/Authority Level (Strictly Protected) ---
UserRouter.get('/admin/all', verifyJWT, populateAdmin, checkPermission("USER_VIEW"), getAllUsers);
UserRouter.get('/admin/user/:userId', verifyJWT, populateAdmin, checkPermission("USER_VIEW"), getUserById);

// This route now uses resolveIdentity so Admin can search for "me" or a specific seekerId
UserRouter.get('/admin/seeker/:id', verifyJWT, populateAdmin, checkPermission("USER_VIEW"), resolveIdentity, getUserDataBySeekerId);

UserRouter.delete('/admin/remove/:userId', verifyJWT, populateAdmin, checkPermission("USER_DELETE"), removeUserById);
UserRouter.patch('/admin/block/:userId', verifyJWT, populateAdmin, checkPermission("USER_BLOCK"), blockUserById);

export default UserRouter;
import { Router } from 'express';
import { 
    createAdmin, 
    loginExistingAdmin, 
    getAllAdmins, 
    getAdminProfile, 
    updateAdminPassword, 
    deleteAdmin, 
    getAllUsers, 
    updateUserStatus, 
    getUserActivityLogs, 
    getPendingAuthorities, 
    verifyAuthority, 
    updateAuthorityTrust, 
    getFlaggedJobs, 
    forceDeleteJob, 
    updateJobStatus, 
    getAllTickets, 
    updateTicketStatus, 
    broadcastNotification, 
    getDashboardStats, 
    createInitialSuperAdmin
} from '../Controllers/Admin.Controllers.js';
import { verifyJWT } from '../Middlewares/VerifyJWT.Middleware.js';
import { checkPermission } from '../Middlewares/CheckPermissions.Middleware.js';
import { populateAdmin } from '../Middlewares/PopulateAdmin.Middleware.js';


const AdminRoutes = Router();

// --- Auth & Profile ---
AdminRoutes.post('/existing/login', loginExistingAdmin); // Public Login
AdminRoutes.get('/me', verifyJWT, populateAdmin, getAdminProfile);
AdminRoutes.patch('/update-password', verifyJWT, populateAdmin, updateAdminPassword);

// --- Admin Management ---
AdminRoutes.post('/seed',createInitialSuperAdmin);
AdminRoutes.post('/create/new', verifyJWT, populateAdmin, checkPermission("ADMIN_MANAGE"), createAdmin);
AdminRoutes.get('/list/all', verifyJWT, populateAdmin, checkPermission("ADMIN_MANAGE"), getAllAdmins);
AdminRoutes.delete('/:id', verifyJWT, populateAdmin, checkPermission("ADMIN_MANAGE"), deleteAdmin);

// --- User Control ---
AdminRoutes.get('/users', verifyJWT, populateAdmin, checkPermission("USER_VIEW"), getAllUsers);
AdminRoutes.patch('/users/:id/status', verifyJWT, populateAdmin, checkPermission("USER_BLOCK"), updateUserStatus);
AdminRoutes.get('/users/:id/logs', verifyJWT, populateAdmin, checkPermission("USER_VIEW"), getUserActivityLogs);

// --- Authority Management ---
AdminRoutes.get('/authorities/pending', verifyJWT, populateAdmin, checkPermission("AUTHORITY_VIEW"), getPendingAuthorities);
AdminRoutes.patch('/authorities/:id/verify', verifyJWT, populateAdmin, checkPermission("AUTHORITY_VERIFY"), verifyAuthority);
AdminRoutes.patch('/authorities/:id/trust', verifyJWT, populateAdmin, checkPermission("AUTHORITY_EDIT_STATS"), updateAuthorityTrust);

// --- Job Moderation ---
AdminRoutes.get('/jobs/flagged', verifyJWT, populateAdmin, checkPermission("JOB_VIEW"), getFlaggedJobs);
AdminRoutes.delete('/jobs/:id', verifyJWT, populateAdmin, checkPermission("JOB_DELETE"), forceDeleteJob);
AdminRoutes.patch('/jobs/:id/status', verifyJWT, populateAdmin, checkPermission("JOB_APPROVE"), updateJobStatus);

// --- Support/Tickets ---
AdminRoutes.get('/tickets', verifyJWT, populateAdmin, checkPermission("TICKET_VIEW"), getAllTickets);
AdminRoutes.patch('/tickets/:id', verifyJWT, populateAdmin, checkPermission("TICKET_RESOLVE"), updateTicketStatus);
AdminRoutes.post('/notifications/broadcast', verifyJWT, populateAdmin, checkPermission("NOTIF_SEND_GLOBAL"), broadcastNotification);

// --- Analytics ---
AdminRoutes.get('/stats/overview', verifyJWT, populateAdmin, checkPermission("VIEW_ANALYTICS_DASHBOARD"), getDashboardStats);

export default AdminRoutes;
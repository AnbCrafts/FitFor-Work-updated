import { generateAccessAndRefreshTokens } from "../Utils/JsonWebToken.Utils.js"; 
import { ROLE_PERMISSIONS } from "../Constants/AdminPermissions.Constant.js"; 
import bcrypt from "bcryptjs";
import User from "../Models/User.Models.js";
import Admin from "../Models/Admin.Models.js";
import crypto from "crypto";

const createAdmin = async (req, res) => {
    try {
        // 1. RBAC Check: Ensure the person making this request is a SuperAdmin
        if (req.user.role !== "Admin" || req.admin?.accessLevel !== "SuperAdmin") {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Only SuperAdmins can create new Admin accounts" 
            });
        }

        const { userId, adminName, accessLevel, secretCode, permissions } = req.body;

        if (!userId || !adminName || !secretCode) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // 2. Validate User Existence
        const validUser = await User.findById(userId);
        if (!validUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 3. Prevent Duplicates
        const existingAdmin = await Admin.findOne({
            $or: [{ adminName }, { userId }]
        });
        if (existingAdmin) {
            return res.status(409).json({ success: false, message: "Admin profile already exists for this user/name" });
        }

        // 4. Handle Permissions & Role Logic
        // If no permissions sent, use the defaults we defined in ROLE_PERMISSIONS
        const finalPermissions = permissions || ROLE_PERMISSIONS[accessLevel || "Moderator"];

        // 5. Security: Hash the secretCode (using your HASH_SECRET if needed, or standard bcrypt)
        const hashedPassword = await bcrypt.hash(secretCode, 10);

        // 6. Create Admin Document
        const newAdmin = new Admin({
            userId,
            adminName,
            accessLevel: accessLevel || "Moderator",
            secretCode: hashedPassword,
            permissions: finalPermissions,
            managedBy: req.admin._id // Track who created this admin (Audit Trail)
        });

        // 7. Update User Document & Link the Admin ID
        validUser.role = "Admin";
        // Assuming your User schema has an adminId field to link them back
        validUser.adminId = newAdmin._id; 

        // 8. Generate Tokens
        const { accessToken, refreshToken } = generateAccessAndRefreshTokens(validUser._id);

        // Save both documents
        await newAdmin.save();
        await validUser.save();

        // 9. Set HttpOnly Cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        };

        return res
            .status(201)
            .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
            .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .json({ 
                success: true, 
                message: "Admin created successfully", 
                admin: {
                    id: newAdmin._id,
                    adminName: newAdmin.adminName,
                    accessLevel: newAdmin.accessLevel
                } 
            });

    } catch (error) {
        console.error("Admin Creation Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
 const createInitialSuperAdmin = async (req, res) => {
    try {
        const { userId, adminName, secretCode } = req.body;

        // Basic Validation
        if (!userId || !adminName || !secretCode) {
            return res.status(400).json({ success: false, message: "Missing fields" });
        }

        // Check if a SuperAdmin already exists (Security Gate)
        const superExists = await Admin.findOne({ accessLevel: "SuperAdmin" });
        if (superExists) {
            return res.status(403).json({ 
                success: false, 
                message: "A SuperAdmin already exists. Use the standard creation route." 
            });
        }

        const validUser = await User.findById(userId);
        if (!validUser) return res.status(404).json({ success: false, message: "User not found" });

        const hashedPassword = await bcrypt.hash(secretCode, 10);

        const newSuperAdmin = new Admin({
            userId,
            adminName,
            accessLevel: "SuperAdmin",
            secretCode: hashedPassword,
            permissions: ["ALL"], // SuperAdmin bypasses checks anyway
        });

        validUser.role = "Admin";
        validUser.adminId = newSuperAdmin._id;

        await newSuperAdmin.save();
        await validUser.save();

        return res.status(201).json({
            success: true,
            message: "Initial SuperAdmin created successfully. Log in to continue.",
        });
    } catch (error) {
        console.error("Setup Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const loginExistingAdmin = async (req, res) => {
    try {
        const { adminName, secretCode } = req.body;

        if (!adminName || !secretCode) {
            return res.status(400).json({ success: false, message: "Missing credentials" });
        }

        // 1. Find Admin and explicitly select secretCode (since we set select: false in schema)
        const validAdmin = await Admin.findOne({ adminName }).select("+secretCode");
        
        if (!validAdmin) {
            return res.status(401).json({ success: false, message: "Invalid Admin credentials" });
        }

        // 2. Verify Secret Code
        const isMatch = await bcrypt.compare(secretCode, validAdmin.secretCode);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid secret code" });
        }

        // 3. Get the associated User ID for the Token
        // We use User._id for the JWT so verifyJWT middleware works for everyone
        const user = await User.findById(validAdmin.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Associated user account not found" });
        }

        // 4. Generate Access and Refresh Tokens
        const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user._id);

        // 5. Generate your Secure Session Hash
        const loginTime = Date.now();
        const shortTime = loginTime.toString().slice(-4);
        // Using your HASH_SECRET from .env for the session hash
        const payload = validAdmin._id.toString() + loginTime + process.env.HASH_SECRET + shortTime;
        const secureHash = crypto.createHash('sha256').update(payload).digest('hex');

        // 6. Set HttpOnly Cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, { 
                ...cookieOptions, 
                maxAge: 15 * 60 * 1000 // 15 mins
            })
            .cookie("refreshToken", refreshToken, { 
                ...cookieOptions, 
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })
            .json({
                success: true,
                message: "Admin Logged In Successfully",
                admin: {
                    id: validAdmin._id,
                    name: validAdmin.adminName,
                    role: user.role,
                    accessLevel: validAdmin.accessLevel,
                    secureHash,
                    loginTime
                }
            });

    } catch (error) {
        console.error("Admin Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        // 1. RBAC Check: Only SuperAdmins should be able to manage/view all staff
        if (req.admin?.accessLevel !== "SuperAdmin") {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Insufficient permissions to view staff list" 
            });
        }

        // 2. Pagination Logic (Industry Standard)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 3. Fetch Admins with Populated User Details
        // We exclude sensitive fields like password and secretCode
        const admins = await Admin.find({})
            .populate("userId", "name email profilePicture") 
            .select("-secretCode") // Security: Never send hashes to a list view
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(limit);

        const totalAdmins = await Admin.countDocuments();

        if (!admins || admins.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No Admin accounts found" 
            });
        }

        // 4. Structured Response
        return res.status(200).json({
            success: true,
            message: "Admin list retrieved successfully",
            count: admins.length,
            totalPages: Math.ceil(totalAdmins / limit),
            currentPage: page,
            admins
        });

    } catch (error) {
        console.error("Fetch Admins Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error while fetching admins" 
        });
    }
};
const getAdminProfile = async (req, res) => {
    try {
        // req.admin is populated via the admin context middleware 
        // using the userId from the verified JWT
        if (!req.admin) {
            return res.status(404).json({ 
                success: false, 
                message: "Admin profile not found" 
            });
        }

        // We return the admin details along with the associated user info
        // already attached to the request object.
        return res.status(200).json({
            success: true,
            message: "Admin profile fetched successfully",
            admin: {
                id: req.admin._id,
                adminName: req.admin.adminName,
                accessLevel: req.admin.accessLevel,
                permissions: req.admin.permissions,
                user: {
                    name: req.user.name,
                    email: req.user.email,
                    profilePicture: req.user.profilePicture
                }
            }
        });

    } catch (error) {
        console.error("Get Admin Profile Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};
const updateAdminPassword = async (req, res) => {
    try {
        const { oldSecretCode, newSecretCode } = req.body;

        if (!oldSecretCode || !newSecretCode) {
            return res.status(400).json({ 
                success: false, 
                message: "Both old and new secret codes are required" 
            });
        }

        // 1. Find the admin (including the secretCode field which is select: false)
        const admin = await Admin.findById(req.admin._id).select("+secretCode");
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin profile not found" });
        }

        // 2. Verify the old secret code
        const isMatch = await bcrypt.compare(oldSecretCode, admin.secretCode);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect old secret code" });
        }

        // 3. Hash the new secret code
        const salt = await bcrypt.genSalt(10);
        const hashedSecret = await bcrypt.hash(newSecretCode, salt);

        // 4. Update and Save
        admin.secretCode = hashedSecret;
        await admin.save();

        // 5. Clear cookies to force re-login (Standard Security Practice for password changes)
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(200).json({
            success: true,
            message: "Secret code updated successfully. Please login again."
        });

    } catch (error) {
        console.error("Update Admin Password Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. RBAC Check: Only SuperAdmins can delete other admin accounts
        if (req.admin?.accessLevel !== "SuperAdmin") {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Only SuperAdmins can revoke admin privileges" 
            });
        }

        // 2. Prevent self-deletion (Safety check)
        if (id === req.admin._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: "You cannot delete your own admin account" 
            });
        }

        // 3. Find the Admin to be deleted
        const adminToDelete = await Admin.findById(id);
        if (!adminToDelete) {
            return res.status(404).json({ success: false, message: "Admin account not found" });
        }

        // 4. Update the associated User's role back to Seeker
        await User.findByIdAndUpdate(adminToDelete.userId, { 
            role: "Seeker",
            $unset: { adminId: "" } // Remove the reference link
        });

        // 5. Remove the Admin document
        await Admin.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: `Admin access for ${adminToDelete.adminName} has been revoked successfully`
        });

    } catch (error) {
        console.error("Delete Admin Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};
const getAllUsers = async (req, res) => {
    try {
        // 1. Permission Check
        if (!req.admin.permissions.includes("USER_VIEW")) {
            return res.status(403).json({ success: false, message: "Access Denied: Insufficient permissions" });
        }

        // 2. Extract Filters from Query
        const { role, search, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // 3. Build Dynamic Query Object
        let query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // 4. Fetch Data
        const users = await User.find(query)
            .select("-password -secretCode") // Security
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments(query);

        return res.status(200).json({
            success: true,
            count: users.length,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: parseInt(page),
            users
        });

    } catch (error) {
        console.error("Get All Users Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, isVerified } = req.body;

        // 1. Permission Check
        const canBlock = req.admin.permissions.includes("USER_BLOCK");
        const canVerify = req.admin.permissions.includes("USER_VERIFY");

        if (!canBlock && !canVerify) {
            return res.status(403).json({ success: false, message: "Access Denied: Insufficient permissions" });
        }

        // 2. Find User
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 3. Prevent Admin from blocking another Admin via this route
        if (user.role === "Admin") {
            return res.status(403).json({ success: false, message: "Cannot modify Admin status via User Control" });
        }

        // 4. Update Fields if permissions allow
        if (status && canBlock) {
            user.status = status; // e.g., "Active", "Blocked", "Suspended"
        }
        
        if (typeof isVerified !== "undefined" && canVerify) {
            user.isVerified = isVerified;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: `User ${user.name} status updated successfully`,
            user: {
                id: user._id,
                status: user.status,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error("Update User Status Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const getUserActivityLogs = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Permission Check
        if (!req.admin.permissions.includes("USER_VIEW")) {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Insufficient permissions to view logs" 
            });
        }

        // 2. Fetch User and their basic activity metadata
        // Note: In a full-scale app, you'd query a dedicated 'Logs' collection.
        // For now, we fetch the User's recent interactions.
        const user = await User.findById(id).select("name email lastLogin loginHistory");
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 3. Simulated/Fetched Activity Data
        // You can expand this by querying your 'Applicants' or 'Job' collections 
        // to see what they've been doing on the platform.
        return res.status(200).json({
            success: true,
            message: `Activity logs for ${user.name} retrieved`,
            logs: {
                lastLogin: user.lastLogin,
                loginHistory: user.loginHistory || [], // Array of timestamps/IPs
                accountCreated: user.createdAt
            }
        });

    } catch (error) {
        console.error("Get User Logs Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const getPendingAuthorities = async (req, res) => {
    try {
        // 1. Permission Check
        if (!req.admin.permissions.includes("AUTHORITY_VIEW")) {
            return res.status(403).json({ success: false, message: "Access Denied: Insufficient permissions" });
        }

        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // 2. Fetch only unverified authorities
        const pendingList = await User.find({ 
            role: "Authority", 
            isVerified: false 
        })
        .select("name email profilePicture createdAt")
        .sort({ createdAt: 1 }) // Oldest first (FIFO)
        .skip(skip)
        .limit(parseInt(limit));

        const totalPending = await User.countDocuments({ role: "Authority", isVerified: false });

        return res.status(200).json({
            success: true,
            count: pendingList.length,
            totalPending,
            totalPages: Math.ceil(totalPending / limit),
            currentPage: parseInt(page),
            authorities: pendingList
        });

    } catch (error) {
        console.error("Get Pending Authorities Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const verifyAuthority = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // "Approve" or "Reject"

        // 1. Permission Check
        if (!req.admin.permissions.includes("AUTHORITY_VERIFY")) {
            return res.status(403).json({ success: false, message: "Access Denied: Insufficient permissions" });
        }

        // 2. Find Authority User
        const authority = await User.findOne({ _id: id, role: "Authority" });
        if (!authority) {
            return res.status(404).json({ success: false, message: "Authority account not found" });
        }

        // 3. Handle Action
        if (action === "Approve") {
            authority.isVerified = true;
            // You can also initialize a default trustScore here
            authority.trustScore = 70; 
        } else if (action === "Reject") {
            authority.isVerified = false;
            // Optionally add a 'rejectionReason' field if your schema supports it
        } else {
            return res.status(400).json({ success: false, message: "Invalid action. Use 'Approve' or 'Reject'" });
        }

        await authority.save();

        return res.status(200).json({
            success: true,
            message: `Authority verification ${action}d successfully`,
            isVerified: authority.isVerified
        });

    } catch (error) {
        console.error("Verify Authority Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const updateAuthorityTrust = async (req, res) => {
    try {
        const { id } = req.params;
        const { trustScore } = req.body;

        // 1. Permission Check
        if (!req.admin.permissions.includes("AUTHORITY_EDIT_STATS")) {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: You do not have permission to edit Trust Scores" 
            });
        }

        // 2. Validate Input
        if (typeof trustScore !== "number" || trustScore < 0 || trustScore > 100) {
            return res.status(400).json({ 
                success: false, 
                message: "Trust score must be a number between 0 and 100" 
            });
        }

        // 3. Find and Update
        const authority = await User.findOneAndUpdate(
            { _id: id, role: "Authority" },
            { $set: { trustScore } },
            { new: true }
        );

        if (!authority) {
            return res.status(404).json({ success: false, message: "Authority account not found" });
        }

        return res.status(200).json({
            success: true,
            message: `Trust score for ${authority.name} updated to ${trustScore}`,
            trustScore: authority.trustScore
        });

    } catch (error) {
        console.error("Update Authority Trust Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const getFlaggedJobs = async (req, res) => {
    try {
        // 1. Permission Check
        if (!req.admin.permissions.includes("JOB_VIEW")) {
            return res.status(403).json({ success: false, message: "Access Denied" });
        }

        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // 2. Fetch jobs where reports count > 0 OR an AI 'isFlagged' flag is true
        // Assuming your Job schema has a reports array or a flag field
        const flaggedJobs = await Job.find({ 
            $or: [
                { "reports.0": { $exists: true } }, 
                { isFlagged: true } 
            ] 
        })
        .populate("postedBy", "name email")
        .sort({ "reports.length": -1 }) // Show most reported first
        .skip(skip)
        .limit(parseInt(limit));

        const totalFlagged = await Job.countDocuments({ 
            $or: [{ "reports.0": { $exists: true } }, { isFlagged: true }] 
        });

        return res.status(200).json({
            success: true,
            count: flaggedJobs.length,
            totalFlagged,
            totalPages: Math.ceil(totalFlagged / limit),
            jobs: flaggedJobs
        });

    } catch (error) {
        console.error("Get Flagged Jobs Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const forceDeleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Permission Check
        if (!req.admin.permissions.includes("JOB_DELETE")) {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: You do not have permission to delete job posts" 
            });
        }

        // 2. Find the Job
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job post not found" });
        }

        // 3. Perform Deletion
        // Note: You might prefer a 'soft-delete' by setting status to 'Deleted' 
        // to keep records for legal/audit reasons.
        await Job.findByIdAndDelete(id);

        // 4. Cleanup (Optional): You could also delete related Applicant records 
        // or notify the postedBy authority.
        return res.status(200).json({
            success: true,
            message: `Job post "${job.jobTitle}" has been removed by administrative action`
        });

    } catch (error) {
        console.error("Force Delete Job Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g., "Open", "Paused", "Closed", "Rejected"

        // 1. Permission Check
        if (!req.admin.permissions.includes("JOB_APPROVE")) {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: You do not have permission to moderate job status" 
            });
        }

        // 2. Validate Status
        const validStatuses = ["Open", "Paused", "Closed", "Rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
            });
        }

        // 3. Update the Job
        const job = await Job.findByIdAndUpdate(
            id,
            { $set: { status: status } },
            { new: true }
        ).populate("postedBy", "name email");

        if (!job) {
            return res.status(404).json({ success: false, message: "Job post not found" });
        }

        // 4. Logic: If rejected, you might want to notify the Authority
        return res.status(200).json({
            success: true,
            message: `Job status updated to ${status} successfully`,
            jobId: job._id,
            newStatus: job.status
        });

    } catch (error) {
        console.error("Update Job Status Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const getAllTickets = async (req, res) => {
    try {
        // 1. Permission Check
        if (!req.admin.permissions.includes("TICKET_VIEW")) {
            return res.status(403).json({ success: false, message: "Access Denied: Insufficient permissions" });
        }

        const { status, priority, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // 2. Build Query
        let query = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;

        // 3. Fetch Tickets (Assuming a 'Ticket' or 'Support' collection exists)
        const tickets = await Ticket.find(query)
            .populate("userId", "name email role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalTickets = await Ticket.countDocuments(query);

        return res.status(200).json({
            success: true,
            count: tickets.length,
            totalTickets,
            totalPages: Math.ceil(totalTickets / limit),
            currentPage: parseInt(page),
            tickets
        });

    } catch (error) {
        console.error("Get All Tickets Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolutionNote } = req.body;

        // 1. Permission Check
        if (!req.admin.permissions.includes("TICKET_RESOLVE")) {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: You do not have permission to resolve tickets" 
            });
        }

        // 2. Validate Status
        const validStatuses = ["Pending", "In Progress", "Resolved", "Closed"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid ticket status" });
        }

        // 3. Update the Ticket
        const ticket = await Ticket.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    status, 
                    resolutionNote,
                    resolvedBy: req.admin._id,
                    resolvedAt: Date.now()
                } 
            },
            { new: true }
        ).populate("userId", "name email");

        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        return res.status(200).json({
            success: true,
            message: `Ticket status updated to ${status} successfully`,
            ticket
        });

    } catch (error) {
        console.error("Update Ticket Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const broadcastNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body; // type: "Alert", "Update", "Promotion"

        // 1. Permission Check
        if (!req.admin.permissions.includes("NOTIF_SEND_GLOBAL")) {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: You do not have permission to send global broadcasts" 
            });
        }

        // 2. Validation
        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and Message are required" });
        }

        // 3. Create Notification for all users
        // Note: In a large-scale app, you would create a single 'GlobalNotification' record 
        // that users fetch, rather than creating 100k individual records to save DB space.
        const newNotification = new Notification({
            title,
            message,
            type: type || "Update",
            sender: req.user._id,
            isGlobal: true,
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // Auto-expire in 7 days
        });

        await newNotification.save();

        // 4. Real-time Push via Socket.io
        // Accessing the io instance attached to the app in server.js
        if (req.io) {
            req.io.emit("receiveNotification", {
                title,
                message,
                type: type || "Update",
                createdAt: newNotification.createdAt
            });
        }

        return res.status(201).json({
            success: true,
            message: "Global notification broadcasted successfully",
            notificationId: newNotification._id
        });

    } catch (error) {
        console.error("Broadcast Notification Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const getDashboardStats = async (req, res) => {
    try {
        // 1. Permission Check
        if (!req.admin.permissions.includes("VIEW_ANALYTICS_DASHBOARD")) {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: You do not have permission to view analytics" 
            });
        }

        // 2. Aggregate Data using Promise.all for Performance (Parallel execution)
        const [
            totalUsers,
            totalSeekers,
            totalAuthorities,
            totalJobs,
            activeJobs,
            totalApplications,
            recentHires
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "Seeker" }),
            User.countDocuments({ role: "Authority" }),
            Job.countDocuments(),
            Job.countDocuments({ status: "Open" }),
            Applicant.countDocuments(),
            // Assuming status "Hired" or "Accepted" exists in your Applicant schema
            Applicant.countDocuments({ status: "Accepted" }) 
        ]);

        // 3. Optional: Get Growth Stats (Users joined in the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newUsersLastMonth = await User.countDocuments({ 
            createdAt: { $gte: thirtyDaysAgo } 
        });

        // 4. Structured Response for Frontend Charts
        return res.status(200).json({
            success: true,
            message: "Analytics overview fetched successfully",
            stats: {
                users: {
                    total: totalUsers,
                    seekers: totalSeekers,
                    authorities: totalAuthorities,
                    newThisMonth: newUsersLastMonth
                },
                jobs: {
                    total: totalJobs,
                    active: activeJobs,
                    closed: totalJobs - activeJobs
                },
                activity: {
                    totalApplications,
                    totalHires: recentHires,
                    successRate: totalApplications > 0 
                        ? ((recentHires / totalApplications) * 100).toFixed(2) + "%" 
                        : "0%"
                }
            }
        });

    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error while generating report" 
        });
    }
};

export { 
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
    getDashboardStats ,createInitialSuperAdmin
};
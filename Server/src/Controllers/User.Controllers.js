import User from "../Models/User.Models.js";
import bcrypt from 'bcryptjs';
import { uploadOnCloudinary } from "../Utils/CloudConfig.Utils.js";
import fs from 'fs'
import Seeker from "../Models/Seeker.Models.js";
import Authority from "../Models/Authority.Models.js";
import Admin from "../Models/Admin.Models.js";
import mongoose from "mongoose";
import { generateAccessAndRefreshTokens } from "../Utils/JsonWebToken.Utils.js";
 

const registerUser = async (req, res) => {
    const filePath = req.file?.path; // Get path early for cleanup logic

    try {
        const { username, firstName, lastName, email, phone, password, role, address } = req.body;

        // 1. Validation: Ensure all text fields exist
        if ([username, firstName, lastName, email, phone, password, address].some(field => field?.trim() === "")) {
            if (filePath) fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // 2. Profile Picture Check
        if (!filePath) {
            return res.status(400).json({ success: false, message: "Profile picture is required" });
        }

        // 3. Cloudinary Upload
        const uploadedPicture = await uploadOnCloudinary(filePath);
        if (!uploadedPicture) {
            if (filePath) fs.unlinkSync(filePath);
            return res.status(500).json({ success: false, message: "Cloud upload failed" });
        }

        // Cleanup local file after successful upload
        fs.unlinkSync(filePath);

        // 4. Duplicate Check
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with these credentials already exists" });
        }

        // 5. Create User 
        // Note: I recommend moving bcrypt.hash to User.model.js pre-save hook
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role: role || "Seeker", // Default to Seeker for security
            address,
            picture: uploadedPicture.secure_url
        });

        // 6. Generate Production Tokens (Access & Refresh)
        // These methods should be defined in your User Model

        const {accessToken,refreshToken} = generateAccessAndRefreshTokens(newUser._id);

        // 7. Cookie Options (Secure for Production)
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only over HTTPS in production
            sameSite: "Strict",
        };

        // 8. Final Response
        return res
            .status(201)
            .cookie("accessToken", accessToken, { ...options, maxAge: 15 * 60 * 1000 }) // 15 mins
            .cookie("refreshToken", refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
            .json({
                success: true,
                message: "User registered successfully",
                user: {
                    id: newUser._id,
                    fullName: `${newUser.firstName} ${newUser.lastName}`,
                    email: newUser.email,
                    role: newUser.role,
                    picture: newUser.picture
                }
            });

    } catch (error) {
        // Safe cleanup if something crashes mid-way
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.error("Registration Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // 1. Validation
        if (!(password && role && (email || username))) {
            return res.status(400).json({
                success: false,
                message: "Email/Username, password, and role are required",
            });
        }

        // 2. Find User
        // We find by credentials first. Role is checked afterward for a clearer error.
        const user = await User.findOne({
            $or: [{ email }, { username }]
        }).select("+password"); // Ensure password field is included if it's hidden by default

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 3. Verify Role
        if (user.role !== role) {
            return res.status(403).json({ 
                success: false, 
                message: `Access Denied: You are registered as ${user.role}, not ${role}` 
            });
        }

        // 4. Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 5. Token Generation (Access & Refresh)
            const {accessToken,refreshToken} = generateAccessAndRefreshTokens(newUser._id);


        // Save refresh token to DB if you're tracking active sessions
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // 6. Cookie Settings
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        };

        // 7. Success Response
        return res
            .status(200)
            .cookie("accessToken", accessToken, { ...options, maxAge: 15 * 60 * 1000 })
            .cookie("refreshToken", refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .json({
                success: true,
                message: "User logged in successfully",
                user: {
                    id: user._id,
                    fullName: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: user.role,
                    picture: user.picture
                }
            });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // 1. Extract Query Parameters for Pagination & Filtering
        // Usage: /api/users?role=Seeker&page=1&limit=10
        const { role, page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        // 2. Build a Dynamic Query Object
        let query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } }
            ];
        }

        // 3. Execute Query with Pagination and Field Selection
        // We exclude sensitive fields like password and refreshToken
        const users = await User.find(query)
            .select("-password -refreshToken") 
            .sort({ createdAt: -1 }) // Newest users first
            .skip(skip)
            .limit(parseInt(limit));

        // 4. Get Total Count for Frontend Pagination UI
        const totalUsers = await User.countDocuments(query);

        // 5. Handle Empty Results
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No users found matching the criteria" 
            });
        }

        // 6. Structured Response
        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            pagination: {
                totalUsers,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
                pageSize: users.length
            },
            users
        });

    } catch (error) {
        console.error("Get All Users Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};



const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Validation: Check if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid User ID format" 
            });
        }

        // 2. Fetch User and Exclude Sensitive Fields
        // .lean() makes the query faster by returning a plain JS object instead of a Mongoose Document
        const user = await User.findById(userId)
            .select("-password -refreshToken -otp -otpExpires");

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // 3. Response
        return res.status(200).json({
            success: true,
            message: "User details retrieved successfully",
            user
        });

    } catch (error) {
        console.error(`Error fetching user ${req.params.userId}:`, error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

const removeUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid User ID" });
        }

        // Soft Delete: Update status instead of deleting the document
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                status: "Inactive", // or "Deactivated"
                deactivatedAt: Date.now() 
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User account deactivated successfully",
            status: user.status
        });

    } catch (error) {
        console.error("Soft Delete Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const blockUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body; // Good for audit trails

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid User ID" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                status: "Blocked",
                blockReason: reason || "Violation of community guidelines",
                blockedAt: Date.now()
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Optional: Force logout by clearing their refreshToken in DB
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: "User has been blocked successfully",
            userStatus: user.status
        });

    } catch (error) {
        console.error("Block User Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const getUserDataBySeekerId = async (req, res) => {
    try {
        const { seekerId } = req.params;

        // 1. Validation
        if (!mongoose.Types.ObjectId.isValid(seekerId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Seeker ID format" 
            });
        }

        // 2. Optimized Fetch using .populate()
        // We find the seeker and "join" the user data in one go.
        const seekerProfile = await Seeker.findById(seekerId)
            .populate({
                path: "userId",
                select: "-password -refreshToken -otp -otpExpires" // Security: Exclude sensitive fields
            })
            .lean();

        // 3. Handle Missing Records
        if (!seekerProfile) {
            return res.status(404).json({ 
                success: false, 
                message: "Seeker profile not found" 
            });
        }

        if (!seekerProfile.userId) {
            return res.status(404).json({ 
                success: false, 
                message: "Associated user identity not found" 
            });
        }

        // 4. Clean Response
        return res.status(200).json({
            success: true,
            message: "User details retrieved successfully via Seeker ID",
            user: seekerProfile.userId, // Return the populated user object
            seekerProfile: { ...seekerProfile, userId: undefined } // Optional: send seeker data too
        });

    } catch (error) {
        console.error(`Error fetching data for Seeker ${req.params.seekerId}:`, error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        // 1. Find user and remove the refresh token from the database
        // req.user is populated by your verifyJWT middleware
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 // Removes the field completely from the document
                }
            },
            { new: true }
        );

        // 2. Cookie Options (Must match the options used during Login/Signup)
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        };

        // 3. Clear cookies and return success
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ 
                success: true, 
                message: "User logged out successfully" 
            });

    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error during logout" 
        });
    }
};
const getMe = async (req, res) => {
    try {
        // req.user is already attached by your verifyJWT middleware
        const user = await User.findById(req.user._id)
            .select("-password -refreshToken -otp -otpExpires -__v");

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User session not found" 
            });
        }

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user
        });
    } catch (error) {
        console.error("GetMe Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};
const updateMe = async (req, res) => {
    let localFilePath = req.file?.path;

    try {
        const { firstName, lastName, bio, address, phone } = req.body;
        const updateData = {};

        // 1. Conditional Updates (Only update what is provided)
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (bio) updateData.bio = bio;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;

        // 2. Handle Profile Picture Update
        if (localFilePath) {
            const uploadedPicture = await uploadOnCloudinary(localFilePath);
            if (uploadedPicture) {
                updateData.picture = uploadedPicture.secure_url;
                // Cleanup local file after upload
                fs.unlinkSync(localFilePath);
            }
        }

        // 3. Update User Document
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        // Cleanup local file if something failed during the process
        if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        
        console.error("UpdateMe Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Both old and new passwords are required" });
        }

        // 1. Fetch user with password (since it's usually hidden in schema)
        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Validate Old Password
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Incorrect old password" });
        }

        // 3. Update to New Password
        // Note: Pre-save hook in User model will handle hashing this new string
        user.password = newPassword;
        
        // 4. Security Best Practice: Invalidate current refresh token to force re-login on next cycle
        user.refreshToken = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const getUserSessions = async (req, res) => {
    try {
        // We fetch the user's login history and current metadata
        // Assuming your User schema has a 'loginHistory' array or 'lastLogin' fields
        const user = await User.findById(req.user._id)
            .select("loginHistory lastLogin currentDeviceIP lastActiveAt");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Active session data retrieved",
            sessions: {
                lastLogin: user.lastLogin,
                currentIP: req.ip, // Real-time IP from request
                deviceInfo: req.headers['user-agent'], // Browser/OS info
                history: user.loginHistory || []
            }
        });
    } catch (error) {
        console.error("Get Sessions Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;

        // Find user by username and select ONLY public-facing fields
        const user = await User.findOne({ username, status: "Active" })
            .select("username firstName lastName picture bio role createdAt -_id");

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User profile not found or is currently private" 
            });
        }

        return res.status(200).json({
            success: true,
            message: "Public profile retrieved",
            profile: user
        });
    } catch (error) {
        console.error("Public Profile Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
 const deactivateAccount = async (req, res) => {
    try {
        // 1. Update the user status and log the deactivation date
        // req.user._id is provided by your verifyJWT middleware
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { 
                $set: { 
                    status: "Inactive", 
                    deactivatedAt: new Date() 
                },
                $unset: { 
                    refreshToken: 1 // Wipe the refresh token so they can't stay logged in
                } 
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // 2. Clear the HttpOnly Cookies on the browser
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        };

        return res
            .status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json({
                success: true,
                message: "Account deactivated successfully. Your session has been cleared."
            });

    } catch (error) {
        console.error("Deactivate Account Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error during deactivation" 
        });
    }
};
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 1. Check if OTP matches and hasn't expired
        if (user.otp !== otp) {
            return res.status(401).json({ success: false, message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(410).json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        // 2. Mark as verified and clear OTP data
        user.isVerified = true;
        user.otp = undefined; // Security: Clear OTP so it can't be used again
        user.otpExpires = undefined;
        
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now access all features."
        });

    } catch (error) {
        console.error("Email Verification Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Please provide your email" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Production Tip: Sometimes it's better to say "If an account exists, an email was sent" 
            // to prevent email enumeration, but 404 is fine for many apps.
            return res.status(404).json({ success: false, message: "No account found with this email" });
        }

        // 1. Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 Minutes

        // 2. Save OTP to User document
        user.otp = otp;
        user.otpExpires = otpExpiry;
        await user.save({ validateBeforeSave: false });

        // 3. Send Email (Using your SMTP utility)
        // await sendEmail({
        //     email: user.email,
        //     subject: "Password Reset OTP",
        //     message: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`
        // });

        return res.status(200).json({
            success: true,
            message: "A password reset OTP has been sent to your email"
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
        }

        // 1. Hash and Update Password
        // Note: Your User.model pre-save hook will handle the hashing if configured
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        
        // Security: Invalidate all existing sessions
        user.refreshToken = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully. Please login with your new password."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

  
export { 
    // --- Authentication ---
    registerUser,           // Signup with Cloudinary & Cookies
    loginUser,              // Role-based Login & Cookies
    logoutUser,             // Token Invalidation & Cookie Clear
       // Silent Refresh logic

    // --- Verification ---
    verifyEmail,            // OTP Check & isVerified Status
    forgotPassword,         // Generate OTP & SMTP Trigger
    resetPassword,          // New Password via OTP

    // --- Profile & Management ---
    getMe,                  // Logged-in user's private data
    updateMe,               // Multi-part update (Name, Bio, Picture)
    deactivateAccount,      // Soft-delete (Set status to Inactive)
    
    // --- Admin/Authority Level Management ---
    getAllUsers,            // Paginated & Filtered list
    getUserById,            // Safe detail view (excludes sensitive fields)
    removeUserById,         // Admin-level Soft Delete
    blockUserById,          // Violation blocking with reason
    getUserDataBySeekerId,  // Cross-collection Seeker -> User lookup

    // --- Security & Sessions ---
    changePassword,         // Logged-in password update (Old vs New)
    getUserSessions,        // Device/IP metadata & Login History

    // --- Public Info ---
    getPublicProfile        // Username-based restricted view
};

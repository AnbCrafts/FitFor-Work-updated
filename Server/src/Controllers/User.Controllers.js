import User from "../Models/User.Models.js";
import bcrypt from 'bcryptjs';
import { uploadOnCloudinary } from "../Utils/CloudConfig.Utils.js";
import fs from 'fs';
import Seeker from "../Models/Seeker.Models.js";
import Authority from "../Models/Authority.Models.js";
import Admin from "../Models/Admin.Models.js";
import mongoose from "mongoose";
import { generateAccessAndRefreshTokens } from "../Utils/JsonWebToken.Utils.js";

// 1. Register User
const registerUser = async (req, res) => {
    const filePath = req.file?.path;
    try {
        const { username, firstName, lastName, email, phone, password, role, address } = req.body;

        if ([username, firstName, lastName, email, phone, password, address].some(field => field?.trim() === "")) {
            if (filePath) fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!filePath) {
            return res.status(400).json({ success: false, message: "Profile picture is required" });
        }

        const uploadedPicture = await uploadOnCloudinary(filePath);
        if (!uploadedPicture) {
            if (filePath) fs.unlinkSync(filePath);
            return res.status(500).json({ success: false, message: "Cloud upload failed" });
        }
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

        const existingUser = await User.findOne({ $or: [{ email }, { phone }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username, firstName, lastName, email, phone,
            password: hashedPassword,
            role: role || "Seeker",
            address,
            picture: uploadedPicture.secure_url
        });

        const { accessToken, refreshToken } = generateAccessAndRefreshTokens(newUser._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        };

        return res
            .status(201)
            .cookie("accessToken", accessToken, { ...options, maxAge: 15 * 60 * 1000 })
            .cookie("refreshToken", refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .json({
                success: true,
                message: "User registered successfully",
                user: { id: newUser._id, fullName: `${newUser.firstName} ${newUser.lastName}`, email: newUser.email, role: newUser.role, picture: newUser.picture }
            });

    } catch (error) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. Login User
const loginUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!(password && role && (email || username))) {
            return res.status(400).json({ success: false, message: "Credentials and role are required" });
        }

        const user = await User.findOne({ $or: [{ email }, { username }] }).select("+password");
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        if (user.role !== role) {
            return res.status(403).json({ success: false, message: `Access Denied: You are ${user.role}` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user._id);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, { ...options, maxAge: 15 * 60 * 1000 })
            .cookie("refreshToken", refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .json({
                success: true,
                user: { id: user._id, fullName: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role, picture: user.picture }
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 3. Logout User
const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });
        const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ success: true, message: "Logged out" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Logout failed" });
    }
};

// 4. Verify Email (OTP)
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(200).json({ success: true, message: "Email verified" });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 5. Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "Email not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        // Logic to send email would go here
        return res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 6. Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(401).json({ success: false, message: "Invalid OTP" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpires = undefined;
        user.refreshToken = undefined;
        await user.save();
        return res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 7. Get Me (Implicit Identity)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) return res.status(404).json({ success: false });

    // Manually find the seeker data using the User's ID
    const seekerProfile = await Seeker.findOne({ userId: user._id });
    const authorityProfile = await Authority.findOne({ ownerId: user._id });

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        seekerProfile: seekerProfile || null,
        authorityProfile: authorityProfile || null
      }
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 8. Update Me (Implicit Identity)
const updateMe = async (req, res) => {
    let localFilePath = req.file?.path;
    try {
        const { firstName, lastName, bio, address, phone } = req.body;
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (bio) updateData.bio = bio;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;

        if (localFilePath) {
            const uploadedPicture = await uploadOnCloudinary(localFilePath);
            updateData.picture = uploadedPicture.secure_url;
            fs.unlinkSync(localFilePath);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return res.status(500).json({ success: false });
    }
};

// 9. Change Password (Implicit Identity)
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select("+password");
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Old password incorrect" });

        user.password = await bcrypt.hash(newPassword, 10);
        user.refreshToken = undefined;
        await user.save();
        return res.status(200).json({ success: true, message: "Password changed" });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 10. Deactivate Account (Implicit Identity)
const deactivateAccount = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { 
            $set: { status: "Inactive", deactivatedAt: new Date() },
            $unset: { refreshToken: 1 }
        });
        const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" };
        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ success: true, message: "Account deactivated" });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 11. Get User Sessions
const getUserSessions = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("lastLogin loginHistory");
        return res.status(200).json({
            success: true,
            sessions: { lastLogin: user.lastLogin, deviceInfo: req.headers['user-agent'], history: user.loginHistory || [] }
        });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 12. Get Public Profile (By Username)
const getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username, status: "Active" })
            .select("username firstName lastName picture bio role createdAt seekerProfile authorityProfile");
        if (!user) return res.status(404).json({ success: false, message: "Profile not found" });
        return res.status(200).json({ success: true, profile: user });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 13. Admin: Get All Users
const getAllUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 10, search } = req.query;
        let query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }
        const users = await User.find(query)
            .select("-password -refreshToken")
            .limit(limit * 1).skip((page - 1) * limit);
        const count = await User.countDocuments(query);
        return res.status(200).json({ success: true, users, totalPages: Math.ceil(count / limit) });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 14. Admin: Get User By ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("-password -refreshToken");
        if (!user) return res.status(404).json({ success: false });
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 15. Admin: Get User Data By Seeker ID (Uses Resolved ID)
const getUserDataBySeekerId = async (req, res) => {
    try {
        const seekerId = req.params.id; // From resolveIdentity middleware
        const seeker = await Seeker.findById(seekerId).populate("userId", "-password -refreshToken");
        if (!seeker) return res.status(404).json({ success: false });
        return res.status(200).json({ success: true, user: seeker.userId, seeker });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 16. Admin: Remove User
const removeUserById = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.userId);
        return res.status(200).json({ success: true, message: "User deleted permanently" });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 17. Admin: Block User
const blockUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { 
            status: "Blocked", 
            blockReason: req.body.reason || "Policy violation" 
        }, { new: true });
        return res.status(200).json({ success: true, message: "User blocked", status: user.status });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

export { 
    registerUser, loginUser, logoutUser, verifyEmail, forgotPassword, resetPassword,
    getMe, updateMe, deactivateAccount, getAllUsers, getUserById, removeUserById,
    blockUserById, getUserDataBySeekerId, changePassword, getUserSessions, getPublicProfile 
};
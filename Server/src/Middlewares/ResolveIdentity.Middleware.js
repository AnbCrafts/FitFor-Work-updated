import Seeker from "../Models/Seeker.Models.js";
import Authority from "../Models/Authority.Models.js"; // Uncomment when needed
import mongoose from "mongoose";

export const resolveIdentity = async (req, res, next) => {
    try {
        // 1. Get the parameter from the URL (could be :id, :seekerId, etc.)
        const paramId = req.params.id || req.params.seekerId;

        // 2. If the ID is NOT "me", just validate it and move on
        if (paramId !== "me") {
            if (!mongoose.Types.ObjectId.isValid(paramId)) {
                return res.status(400).json({ success: false, message: "Invalid ID format" });
            }
            return next();
        }

        // 3. If the ID IS "me", find the Seeker/Authority ID based on the User's role
        const userId = req.user._id;
        let profileId = null;

        if (req.user.role === "Seeker") {
            const seeker = await Seeker.findOne({ userId }).select("_id");
            profileId = seeker?._id;
        } 
         else if (req.user.role === "Authority") {
            const auth = await Authority.findOne({ userId }).select("_id");
            profileId = auth?._id;
        } 
        

        if (!profileId) {
            return res.status(404).json({ 
                success: false, 
                message: "Professional profile not found for this account." 
            });
        }

        // 4. Overwrite the "me" string with the real hex ID
        // This ensures the controller receives a valid ObjectId
        if (req.params.id) req.params.id = profileId.toString();
        if (req.params.seekerId) req.params.seekerId = profileId.toString();

        next();
    } catch (error) {
        console.error("Identity Resolution Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
import Admin from "../Models/Admin.Models.js";

export const populateAdmin = async (req, res, next) => {
    try {
        // req.user is already set by verifyJWT middleware
        if (!req.user || req.user.role !== 'Admin') {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: User is not an Admin" 
            });
        }

        // Find the admin profile associated with this user
        const adminProfile = await Admin.findOne({ userId: req.user._id });

        if (!adminProfile) {
            return res.status(404).json({ 
                success: false, 
                message: "Admin profile context not found for this user" 
            });
        }

        // Attach the full admin document to the request
        req.admin = adminProfile;
        next();
    } catch (error) {
        console.error("Populate Admin Middleware Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error during Admin authorization" 
        });
    }
};
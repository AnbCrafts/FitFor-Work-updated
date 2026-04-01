export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            // 1. Ensure the user is an Admin
            if (req.user.role !== 'Admin') {
                return res.status(403).json({ 
                    success: false, 
                    message: "Access Denied: Admin privileges required" 
                });
            }

            // 2. Ensure the Admin context is loaded (req.admin)
            if (!req.admin) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Admin profile context not found" 
                });
            }

            // 3. SuperAdmin bypass: They can do everything
            if (req.admin.accessLevel === 'SuperAdmin') {
                return next();
            }

            // 4. Check for the specific permission string
            if (!req.admin.permissions.includes(requiredPermission)) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Access Denied: Missing permission [${requiredPermission}]` 
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ success: false, message: "Permission check failed" });
        }
    };
};
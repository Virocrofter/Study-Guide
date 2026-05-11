import { getSession } from "@auth/express";

// This protects routes for any logged-in user
export const protectUser = async (req, res, next) => {
    try {
        // Auth.js session is typically available in res.locals.session 
        // if the middleware is mounted in server.js
        const session = res.locals.session;

        if (!session) {
            return res.status(401).json({ 
                success: false, 
                message: "Please login to continue." 
            });
        }

        req.user = session.user;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// This protects routes specifically for Educators
export const protectEducator = async (req, res, next) => {
    try {
        const session = res.locals.session;

        if (!session) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized. Please login." 
            });
        }

        // Check the role (Ensure your MongoDB User model has a 'role' field)
        if (session.user.role !== 'educator') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Educator account required." 
            });
        }

        req.user = session.user;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
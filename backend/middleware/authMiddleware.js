import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes
export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ error: "Not authorized, user not found" });
            }

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            return res.status(401).json({ error: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ error: "Not authorized, no token" });
    }
};

// Middleware to check user roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.user_type)) {
            return res.status(403).json({
                error: `User role ${req.user?.user_type} is not authorized to access this route`,
            });
        }
        next();
    };
};

// Middleware to validate report access
export const validateReportAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        const report = await User.db.model("Report").findById(id); // Use the existing model if already registered

        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }

        const userWallet = req.user.wallet.toLowerCase();
        const isPatient = report.patient.toLowerCase() === userWallet;
        const isDoctor = report.doctors.some(d => d.toLowerCase() === userWallet);

        if (!isPatient && !isDoctor) {
            return res.status(403).json({
                error: "Access denied: You are not authorized to access this report",
            });
        }

        next();
    } catch (error) {
        console.error("Report Access Validation Error:", error);
        return res.status(500).json({ error: "Authorization check failed" });
    }
};

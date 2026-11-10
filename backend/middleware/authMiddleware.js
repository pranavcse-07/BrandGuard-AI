
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

// VERIFY USER TOKEN
const protect = async (req, res, next) => {
    try {
        let token;

        // Check Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Check whether token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login first."
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find user in MongoDB
        const user = await User.findById(decoded.userId)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Attach user information to request
        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};


// CHECK USER ROLE
const authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource"
            });
        }

        next();
    };
};

module.exports = {
    protect,
    authorizeRoles
};

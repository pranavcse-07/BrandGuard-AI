const rateLimit = require("express-rate-limit");
const express = require("express");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again after 15 minutes."
    }
});

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authLimiter, registerUser);
router.post("/login",authLimiter, loginUser);

// Protected route
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        user: req.user
    });
});

// Admin-only route
router.get(
    "/admin",
    protect,
    authorizeRoles("admin"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome Admin!"
        });
    }
);

module.exports = router;


const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check input types
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required as strings"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        // Validate empty values
        if (!cleanName || !cleanEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password cannot be empty"
            });
        }

        // Validate name length
        if (cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name cannot exceed 100 characters"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            cleanEmail.length > 254 ||
            !emailRegex.test(cleanEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        if (Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                success: false,
                message: "Password cannot exceed 72 bytes"
            });
        }

        // Check existing user
        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};


// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check input types
        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required as strings"
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        if (
            cleanEmail.length > 254 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password format"
            });
        }

        // Find user
        const user = await User.findOne({
            email: cleanEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};

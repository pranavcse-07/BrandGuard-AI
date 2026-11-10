
const mongoose = require("mongoose");
const Content = require("../models/Content");
const Brand = require("../models/Brand");

// Submit new content
const createContent = async (req, res) => {
    try {
        const { title, contentText, brandId } = req.body;

        // Check required fields and their types
        if (
            typeof title !== "string" ||
            typeof contentText !== "string" ||
            typeof brandId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, content text and brand ID are required as strings"
            });
        }

        // Prevent empty or whitespace-only input
        if (!title.trim() || !contentText.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and content text cannot be empty"
            });
        }

        // Validate title length
        if (title.trim().length > 150) {
            return res.status(400).json({
                success: false,
                message: "Title cannot exceed 150 characters"
            });
        }

        // Validate content length
        if (contentText.trim().length > 10000) {
            return res.status(400).json({
                success: false,
                message: "Content text cannot exceed 10000 characters"
            });
        }

        // Validate MongoDB brand ID
        if (!mongoose.isValidObjectId(brandId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid brand ID"
            });
        }

        // Check whether brand exists and is active
        const brand = await Brand.findOne({
            _id: brandId,
            status: "active"
        });

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found or inactive"
            });
        }

        // Save submitted content
        const content = await Content.create({
            title: title.trim(),
            contentText: contentText.trim(),
            brand: brandId,
            uploadedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Content submitted successfully",
            content
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get submitted content according to user role
const getContents = async (req, res) => {
    try {
        // Admin and reviewer can see all contents
        // Creator can see only their own contents
        const filter =
            req.user.role === "admin" || req.user.role === "reviewer"
                ? {}
                : { uploadedBy: req.user._id };

        const contents = await Content.find(filter)
            .populate("brand", "brandName")
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contents.length,
            contents
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createContent,
    getContents
};

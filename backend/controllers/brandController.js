
const Brand = require("../models/Brand");

// Create a new brand
const createBrand = async (req, res) => {
    try {
        const {
            brandName,
            description,
            industry,
            voiceTone,
            approvedTerms,
            prohibitedTerms,
            primaryColors,
            typography,
            requiredDisclaimers,
            approvedClaims
        } = req.body;

        // Validate brand name
        if (
            typeof brandName !== "string" ||
            !brandName.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid brand name is required"
            });
        }

        if (brandName.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "Brand name cannot exceed 100 characters"
            });
        }

        // Validate optional text fields
        if (
            (description !== undefined && typeof description !== "string") ||
            (industry !== undefined && typeof industry !== "string")
        ) {
            return res.status(400).json({
                success: false,
                message: "Description and industry must be strings"
            });
        }

        // Validate array fields
        const arrayFields = {
            voiceTone,
            approvedTerms,
            prohibitedTerms,
            primaryColors,
            typography,
            requiredDisclaimers,
            approvedClaims
        };

        for (const [field, value] of Object.entries(arrayFields)) {
            if (
                value !== undefined &&
                (!Array.isArray(value) ||
                    !value.every(item => typeof item === "string"))
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} must be an array of strings`
                });
            }
        }

        // Create brand
        const brand = await Brand.create({
            brandName: brandName.trim(),
            description: description?.trim() || "",
            industry: industry?.trim() || "",
            voiceTone,
            approvedTerms,
            prohibitedTerms,
            primaryColors,
            typography,
            requiredDisclaimers,
            approvedClaims,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Brand created successfully",
            brand
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get brands
const getBrands = async (req, res) => {
    try {
        const filter =
            req.user.role === "admin"
                ? {}
                : { status: "active" };

        const brands = await Brand.find(filter)
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: brands.length,
            brands
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createBrand,
    getBrands
};

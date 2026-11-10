
const Content = require("../models/Content");
const Brand = require("../models/Brand");

const getDashboardStats = async (req, res) => {
    try {
        // 1. Filter data according to user role
        const contentFilter =
            req.user.role === "admin" || req.user.role === "reviewer"
                ? {}
                : { uploadedBy: req.user._id };

        const brandFilter =
            req.user.role === "admin" || req.user.role === "reviewer"
                ? {}
                : { createdBy: req.user._id };

        // 2. Count total content
        const totalContents = await Content.countDocuments(contentFilter);

        // 3. Count content according to status
        const pendingContents = await Content.countDocuments({
            ...contentFilter,
            status: "pending"
        });

        const processingContents = await Content.countDocuments({
            ...contentFilter,
            status: "processing"
        });

        const reviewContents = await Content.countDocuments({
            ...contentFilter,
            status: "review"
        });

        const approvedContents = await Content.countDocuments({
            ...contentFilter,
            status: "approved"
        });

        const rejectedContents = await Content.countDocuments({
            ...contentFilter,
            status: "rejected"
        });

        // 4. Count total brands
        const totalBrands = await Brand.countDocuments(brandFilter);

        // 5. Calculate average compliance score
        const result = await Content.aggregate([
            { $match: contentFilter },
            {
                $match: {
                    complianceScore: { $ne: null }
                }
            },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: "$complianceScore" }
                }
            }
        ]);

        const averageComplianceScore =
            result.length > 0
                ? Math.round(result[0].averageScore)
                : 0;

        // 6. Send dashboard statistics
        res.status(200).json({
            success: true,
            message: "Dashboard statistics fetched successfully",
            stats: {
                totalContents,
                totalBrands,
                pendingContents,
                processingContents,
                reviewContents,
                approvedContents,
                rejectedContents,
                averageComplianceScore
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getDashboardStats };


const mongoose = require("mongoose");
const Content = require("../models/Content");

const reviewContent = async (req, res) => {
    try {
        const { contentId } = req.params;
        const { decision, reviewComment } = req.body;

        // Validate content ID
        if (!mongoose.isValidObjectId(contentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid content ID"
            });
        }

        // Validate decision
        if (!["approved", "rejected"].includes(decision)) {
            return res.status(400).json({
                success: false,
                message: "Decision must be approved or rejected"
            });
        }

        // Validate review comment type
        if (
            reviewComment !== undefined &&
            typeof reviewComment !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Review comment must be a string"
            });
        }
        if (
    typeof reviewComment === "string" &&
    reviewComment.length > 1000
) {
    return res.status(400).json({
        success: false,
        message: "Review comment cannot exceed 1000 characters"
    });
}

        // Rejection requires a comment
        if (
            decision === "rejected" &&
            (!reviewComment || !reviewComment.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Review comment is required when rejecting content"
            });
        }

        // Check whether content exists
        const existingContent = await Content.findById(contentId);

        if (!existingContent) {
            return res.status(404).json({
                success: false,
                message: "Content not found"
            });
        }

        // Only analyzed content can be reviewed
        if (existingContent.status !== "review") {
            return res.status(400).json({
                success: false,
                message: "Content is not awaiting review"
            });
        }

        // Atomic update: only one reviewer can finalize this content
        const content = await Content.findOneAndUpdate(
            {
                _id: contentId,
                status: "review"
            },
            {
                $set: {
                    status: decision,
                    reviewedBy: req.user._id,
                    reviewComment: reviewComment
                        ? reviewComment.trim()
                        : "",
                    reviewedAt: new Date()
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!content) {
            return res.status(409).json({
                success: false,
                message: "Content has already been reviewed"
            });
        }

        res.status(200).json({
            success: true,
            message: `Content ${decision} successfully`,
            content: {
                contentId: content._id,
                title: content.title,
                status: content.status,
                reviewedBy: content.reviewedBy,
                reviewComment: content.reviewComment,
                reviewedAt: content.reviewedAt
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { reviewContent };

const mongoose = require("mongoose");
const Content = require("../models/Content");
const Brand = require("../models/Brand");

const analyzeContent = async (req, res) => {
    try {
        // 1. Get content ID from request URL
        const { contentId } = req.params;
                if (!mongoose.isValidObjectId(contentId)) {
    return res.status(400).json({
        success: false,
        message: "Invalid content ID"
    });
}
        // 2. Find submitted content
        const content = await Content.findById(contentId);

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found"
            });
        }
        if (["approved", "rejected"].includes(content.status)) {
    return res.status(400).json({
        success: false,
        message: "Finalized content cannot be analyzed again"
    });
}

        // 3. Find the brand guidelines
        const brand = await Brand.findById(content.brand);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand guidelines not found"
            });
        }

        const text = content.contentText.toLowerCase();

        const violations = [];
        const suggestions = [];

        // 4. Check prohibited terms
        for (const term of brand.prohibitedTerms) {
            if (text.includes(term.toLowerCase())) {
                violations.push({
                    type: "Prohibited Term",
                    term: term,
                    message: `The term "${term}" is not allowed by this brand.`
                });

                suggestions.push(
                    `Remove or replace "${term}" with brand-approved wording.`
                );
            }
        }

        // 5. Check required disclaimers
        for (const disclaimer of brand.requiredDisclaimers) {
            if (!text.includes(disclaimer.toLowerCase())) {
                violations.push({
                    type: "Missing Disclaimer",
                    term: disclaimer,
                    message: `Required disclaimer "${disclaimer}" is missing.`
                });

                suggestions.push(
                    `Add the required disclaimer: "${disclaimer}"`
                );
            }
        }

        // 6. Calculate compliance score
        const deduction = violations.length * 20;
        const complianceScore = Math.max(0, 100 - deduction);

        // 7. Update content analysis results
        content.complianceScore = complianceScore;
        content.violations = violations;
        content.suggestions = suggestions;
        content.status = "review";

        await content.save();

        // 8. Send analysis result
        res.status(200).json({
            success: true,
            message: "Brand compliance analysis completed",
            analysis: {
                contentId: content._id,
                title: content.title,
                brandName: brand.brandName,
                complianceScore,
                totalViolations: violations.length,
                violations,
                suggestions,
                status: content.status
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { analyzeContent };

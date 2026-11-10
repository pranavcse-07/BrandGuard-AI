
const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        contentText: {
            type: String,
            required: true
        },

        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "review",
                "approved",
                "rejected"
            ],
            default: "pending"
        },

        complianceScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },

        violations: {
            type: Array,
            default: []
        },

        suggestions: {
            type: [String],
            default: []
        },

        // Human review information
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewComment: {
            type: String,
            default: ""
        },

        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;

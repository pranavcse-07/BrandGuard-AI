
const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
    {
        brandName: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        industry: {
            type: String,
            default: ""
        },

        voiceTone: {
            type: [String],
            default: []
        },

        approvedTerms: {
            type: [String],
            default: []
        },

        prohibitedTerms: {
            type: [String],
            default: []
        },

        primaryColors: {
            type: [String],
            default: []
        },

        typography: {
            type: [String],
            default: []
        },

        requiredDisclaimers: {
            type: [String],
            default: []
        },

        approvedClaims: {
            type: [String],
            default: []
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;

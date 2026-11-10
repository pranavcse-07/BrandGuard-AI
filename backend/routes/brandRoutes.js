const express = require("express");
const router = express.Router();

const {
    createBrand,
    getBrands
} = require("../controllers/brandController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Create a brand (Admin only)
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createBrand
);

// Get all active brands
router.get(
    "/",
    protect,
    getBrands
);

module.exports = router;
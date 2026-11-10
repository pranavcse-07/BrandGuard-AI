
const express = require("express");
const router = express.Router();

const { reviewContent } = require("../controllers/reviewController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Approve or reject submitted content
router.patch(
    "/:contentId",
    protect,
    authorizeRoles("admin", "reviewer"),
    reviewContent
);

module.exports = router;

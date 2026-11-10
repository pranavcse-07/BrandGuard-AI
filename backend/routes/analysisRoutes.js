
const express = require("express");
const router = express.Router();

const { analyzeContent } = require("../controllers/analysisController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Analyze submitted content
router.post(
    "/:contentId",
    protect,
    authorizeRoles("admin", "reviewer"),
    analyzeContent
);

module.exports = router;

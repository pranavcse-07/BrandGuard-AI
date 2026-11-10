
const express = require("express");
const router = express.Router();

const {
    createContent,
    getContents
} = require("../controllers/contentController");

const {
    protect,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Only creators and admins can submit content
router.post(
    "/",
    protect,
    authorizeRoles("creator", "admin"),
    createContent
);

// Authenticated users can retrieve content
router.get(
    "/",
    protect,
    getContents
);

module.exports = router;

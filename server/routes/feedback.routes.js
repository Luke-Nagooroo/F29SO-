const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { submitFeedback, getFeedback } = require("../controllers/feedback.controller");

router.post("/", authenticate, submitFeedback);
router.get("/", authenticate, authorize("admin"), getFeedback);

module.exports = router;

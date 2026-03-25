const express = require("express");
const router = express.Router();
const { exportCSV, exportPDF } = require("../controllers/export.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);

// GET /api/export/csv?startDate=&endDate=&userId=
router.get("/csv", exportCSV);

// GET /api/export/pdf?startDate=&endDate=&userId=
router.get("/pdf", exportPDF);

module.exports = router;

const express = require("express");
const router = express.Router();
const medicationController = require("../controllers/medication.controller");const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);

router.post("/", medicationController.createMedication);
router.get("/", medicationController.getMedications);
router.get("/today", medicationController.getTodayStatus);
router.get("/stats", medicationController.getAdherenceStats);
router.get("/stats/:userId", medicationController.getAdherenceStats);
router.get("/user/:userId", medicationController.getMedications);
router.put("/:id", medicationController.updateMedication);
router.delete("/:id", medicationController.deleteMedication);
router.delete("/:id/permanent", medicationController.hardDeleteMedication);
router.post("/:id/log", medicationController.logAdherence);

module.exports = router;

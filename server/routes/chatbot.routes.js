const express = require("express");
const { sendChatMessage } = require("../controllers/chatbot.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/message", requireAuth, sendChatMessage);

module.exports = router;

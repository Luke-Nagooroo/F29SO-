const express = require("express");
const { authenticate } = require("../middleware/auth.middleware");
const {
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount,
} = require("../controllers/message.controller");

const router = express.Router();

router.use(authenticate);

router.get("/conversations", getConversations);
router.get("/unread-count", getUnreadCount);
router.get("/:userId", getMessages);
router.post("/", sendMessage);

module.exports = router;

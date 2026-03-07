const Message = require("../models/Message.model");
const User = require("../models/User.model");

const sanitizeMessage = (value = "") => String(value).trim();

const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Recipient and content are required",
      });
    }

    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    const conversationId = Message.createConversationId(req.user._id, recipientId);

    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      recipientId,
      content: sanitizeMessage(content),
    });

    const populatedMessage = await message.populate(
      "senderId recipientId",
      "email role profile.firstName profile.lastName",
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationId}`).emit("message:new", populatedMessage);
      io.to(`user:${recipientId}`).emit("message:new", populatedMessage);
    }

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { recipientId: req.user._id }],
    })
      .populate("senderId recipientId", "role profile.firstName profile.lastName")
      .sort({ createdAt: -1 });

    const conversationMap = new Map();

    messages.forEach((message) => {
      const { conversationId } = message;

      if (!conversationMap.has(conversationId)) {
        const participant =
          message.senderId._id.toString() === req.user._id.toString()
            ? message.recipientId
            : message.senderId;

        conversationMap.set(conversationId, {
          conversationId,
          participant,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      if (message.recipientId._id.toString() === req.user._id.toString() && !message.isRead) {
        conversationMap.get(conversationId).unreadCount += 1;
      }
    });

    return res.json({
      success: true,
      data: Array.from(conversationMap.values()),
    });
  } catch (error) {
    console.error("getConversations error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load conversations",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationId = Message.createConversationId(req.user._id, userId);

    const messages = await Message.find({ conversationId })
      .populate("senderId recipientId", "role profile.firstName profile.lastName")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        conversationId,
        recipientId: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationId}`).emit("message:read", {
        conversationId,
        readBy: req.user._id,
      });
    }

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load messages",
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.getUnreadCount(req.user._id);

    return res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load unread count",
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  getUnreadCount,
};

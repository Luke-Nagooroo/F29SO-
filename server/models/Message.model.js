const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "system"],
      default: "text",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, isRead: 1 });

messageSchema.statics.createConversationId = function createConversationId(userIdA, userIdB) {
  const sortedIds = [userIdA.toString(), userIdB.toString()].sort();
  return sortedIds.join("_");
};

messageSchema.statics.getUnreadCount = function getUnreadCount(userId) {
  return this.countDocuments({ recipientId: userId, isRead: false });
};

module.exports = mongoose.model("Message", messageSchema);

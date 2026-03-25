const Feedback = require("../models/Feedback.model");

const submitFeedback = async (req, res) => {
  try {
    const { rating, category, message } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const validCategories = [
      "Bug Report",
      "Feature Request",
      "General Feedback",
      "Compliment",
    ];
    if (!category || !validCategories.includes(category)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid feedback category" });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters",
      });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      rating,
      category,
      message: message.trim(),
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    console.error("submitFeedback error:", err);
    res.status(500).json({ success: false, message: "Failed to submit feedback" });
  }
};

const getFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Feedback.find()
        .populate("userId", "email profile.firstName profile.lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments(),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getFeedback error:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve feedback" });
  }
};

module.exports = { submitFeedback, getFeedback };

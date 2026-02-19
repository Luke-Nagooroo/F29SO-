const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const useGemini = Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 20);
const genAI = useGemini ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const emergencyKeywords = [
  "chest pain",
  "difficulty breathing",
  "can't breathe",
  "severe bleeding",
  "unconscious",
  "suicide",
  "kill myself",
];

const fallbackReply = (message) => {
  const text = message.toLowerCase();

  if (text.includes("sleep")) {
    return "Good sleep starts with a regular bedtime, less caffeine late in the day, and a cool, dark room. If sleep issues keep happening, it is worth discussing with a healthcare professional.";
  }

  if (text.includes("blood pressure") || text.includes("bp")) {
    return "For many adults, a blood pressure around 120/80 mmHg is considered healthy. One reading does not tell the full story, so trends over time matter more.";
  }

  if (text.includes("water") || text.includes("hydration")) {
    return "Hydration needs vary, but drinking water regularly across the day and checking that your urine stays pale yellow is a practical rule of thumb.";
  }

  if (text.includes("diet") || text.includes("meal")) {
    return "A simple healthy plate is half vegetables, a quarter lean protein, and a quarter whole grains or other high-fiber carbs. Try to keep sugary drinks and ultra-processed snacks limited.";
  }

  return "I can help with general wellness guidance, healthy routines, and understanding common health topics. For symptoms, diagnoses, medicines, or urgent concerns, please consult a qualified clinician.";
};

exports.sendChatMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const lowerMessage = message.toLowerCase();
    const isEmergency = emergencyKeywords.some((keyword) =>
      lowerMessage.includes(keyword),
    );

    if (isEmergency) {
      return res.json({
        success: true,
        data: {
          response:
            "This sounds urgent. Please contact emergency services or go to the nearest emergency department right away. Online guidance is not enough for this situation.",
          isEmergency: true,
        },
      });
    }

    if (!genAI) {
      return res.json({
        success: true,
        data: {
          response: fallbackReply(message),
          isEmergency: false,
          mockMode: true,
        },
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = [
      "You are MEDXI Health Assistant.",
      "Give supportive, practical health and wellness guidance in simple language.",
      "Do not diagnose diseases or prescribe medication.",
      "If the issue sounds urgent, tell the user to seek emergency care.",
      conversationHistory.length
        ? `Recent conversation: ${conversationHistory
            .slice(-4)
            .map((item) => `${item.role}: ${item.content}`)
            .join("\n")}`
        : "",
      `User question: ${message}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.json({
      success: true,
      data: {
        response: responseText,
        isEmergency: false,
      },
    });
  } catch (error) {
    console.error("Chatbot error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to generate chatbot response right now",
    });
  }
};

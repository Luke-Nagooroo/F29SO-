require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const { verifyToken } = require("./utils/jwt.util");
const authRoutes = require("./routes/auth.routes");
const chatbotRoutes = require("./routes/chatbot.routes");
const googleFitRoutes = require("./routes/googlefit.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const messageRoutes = require("./routes/message.routes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medxi";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return next(new Error("Invalid token"));
  }

  socket.userId = decoded.userId;
  return next();
});

io.on("connection", (socket) => {
  const userId = socket.userId;

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socket.id);
  socket.join(`user:${userId}`);
  io.emit("user:online", userId);

  socket.on("conversation:join", (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on("conversation:leave", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });

  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(userId);

    if (!userSockets) return;

    userSockets.delete(socket.id);

    if (userSockets.size === 0) {
      onlineUsers.delete(userId);
      io.emit("user:offline", userId);
    }
  });
});

app.set("io", io);
app.set("onlineUsers", onlineUsers);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "MEDXI backend is running",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/googlefit", googleFitRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/messages", messageRoutes);

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

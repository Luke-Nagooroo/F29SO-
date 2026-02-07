const User = require("../models/User.model");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt.util");

const sanitizeUser = (user) => ({
  _id: user._id,
  email: user.email,
  role: user.role,
  profile: user.profile,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = "patient" } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, first name, and last name are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      role: ["patient", "provider", "admin"].includes(role) ? role : "patient",
      profile: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create account",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log in",
    });
  }
};

const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log out",
    });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const decoded = verifyToken(refreshToken, true);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is not valid for this user",
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to refresh access token",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
};

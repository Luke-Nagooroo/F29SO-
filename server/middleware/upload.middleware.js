const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // UUID-based filename — prevents path traversal and name collisions
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    // Sanitize extension: only allow alphanumeric chars
    const ext = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, "");
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Magic bytes for file type validation
const MAGIC_BYTES = {
  "image/jpeg": [Buffer.from([0xff, 0xd8, 0xff])],
  "image/png": [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
  "image/gif": [Buffer.from("GIF87a"), Buffer.from("GIF89a")],
  "image/webp": [Buffer.from("RIFF")],
  "application/pdf": [Buffer.from("%PDF")],
};

const fileFilter = (req, file, cb) => {
  // Check MIME type whitelist
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error("File type not allowed"), false);
  }

  // Reject filenames with path traversal attempts
  const originalName = file.originalname || "";
  if (originalName.includes("..") || originalName.includes("/") || originalName.includes("\\")) {
    return cb(new Error("Invalid filename"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * Middleware to validate file magic bytes after upload
 */
const validateFileContent = (req, res, next) => {
  if (!req.file && !req.files) return next();

  const files = req.file ? [req.file] : (req.files || []);

  for (const file of files) {
    const magicSignatures = MAGIC_BYTES[file.mimetype];
    if (magicSignatures) {
      try {
        const fd = fs.openSync(file.path, "r");
        const buffer = Buffer.alloc(8);
        fs.readSync(fd, buffer, 0, 8, 0);
        fs.closeSync(fd);

        const matches = magicSignatures.some((sig) =>
          buffer.subarray(0, sig.length).equals(sig),
        );

        if (!matches) {
          // Delete the suspicious file
          fs.unlinkSync(file.path);
          return res.status(400).json({
            success: false,
            message: "File content does not match declared type",
          });
        }
      } catch (e) {
        // If we can't read it, delete and reject
        try { fs.unlinkSync(file.path); } catch (_) { /* ignore */ }
        return res.status(400).json({
          success: false,
          message: "Failed to validate file",
        });
      }
    }
  }

  next();
};

module.exports = upload;
module.exports.validateFileContent = validateFileContent;

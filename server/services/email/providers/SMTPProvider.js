const nodemailer = require("nodemailer");

class SMTPProvider {
  constructor() {
    this.transporter = null;
    this.configured = false;
    this._init();
  }

  _init() {
    const mode = process.env.EMAIL_MODE || "maildev";

    if (mode === "smtp" && process.env.EMAIL_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      this.configured = true;
    } else if (mode === "maildev") {
      // MailDev local dev server (localhost:1025, no auth)
      this.transporter = nodemailer.createTransport({
        host: "localhost",
        port: 1025,
        ignoreTLS: true,
      });
      this.configured = true;
    } else {
      // Fallback: create an Ethereal test account on demand
      this._initEthereal();
    }
  }

  async _initEthereal() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.configured = true;
      console.log(
        `✓ Ethereal test account ready: ${testAccount.user} — view emails at https://ethereal.email`,
      );
    } catch (err) {
      console.warn("⚠️ Could not create Ethereal test account:", err.message);
    }
  }

  isConfigured() {
    return this.configured;
  }

  async send({ to, subject, html, text }) {
    if (!this.transporter) {
      throw new Error("SMTP transporter not initialized");
    }

    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || '"MEDXI Health" <noreply@medxi.health>',
      to,
      subject,
      html,
      text,
    });

    // Log Ethereal preview URL when available
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Preview email: ${previewUrl}`);
    }

    return { messageId: info.messageId, previewUrl };
  }
}

module.exports = SMTPProvider;

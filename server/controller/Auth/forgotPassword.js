// controller/Auth/forgotPassword.js
const UserModel = require("../../models/user.models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const forgotPassword = async (req, res, next) => {
  try {
    // Normalise: accept both `email` and `Email`
    const email = (req.body.email || req.body.Email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await UserModel.findOne({ email });

    // Always return the same generic message — prevents email enumeration attacks
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with that email, a reset link has been sent.",
      });
    }

    // Generate a secure 32-byte random token
    const token = crypto.randomBytes(32).toString("hex");

    // Token valid for 1 hour
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Build reset URL — use /#/ prefix because frontend uses HashRouter
    const clientUrl = process.env.CLIENT_URL || "https://codevibeforyou.netlify.app";
    const resetLink = `${clientUrl}/#/ResetPassword?token=${token}`;

    // Read SMTP credentials from environment variables — NEVER hardcode these
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error("❌ EMAIL_USER or EMAIL_PASS missing in .env");
      // In development, log the link so you can test without email
      if (process.env.NODE_ENV !== "production") {
        console.log("DEV reset link:", resetLink);
      }
      return res.status(500).json({
        success: false,
        message: "Email service is not configured. Set EMAIL_USER and EMAIL_PASS in your .env file.",
        ...(process.env.NODE_ENV !== "production" && { resetLink }),
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from: `"CodeVibe" <${process.env.EMAIL_FROM || emailUser}>`,
      to: email,
      subject: "Reset your CodeVibe password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
          <h2 style="color:#e63946;">CodeVibe — Password Reset</h2>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${resetLink}" style="background:#e63946;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">
              Reset Password
            </a>
          </p>
          <p style="color:#666;font-size:0.88em;">This link expires in <strong>1 hour</strong>. If you didn't request this, you can ignore this email.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
          <p style="color:#999;font-size:0.8em;">Link not working? Copy and paste: <a href="${resetLink}">${resetLink}</a></p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "If an account exists with that email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    next(error);
  }
};

module.exports = forgotPassword;
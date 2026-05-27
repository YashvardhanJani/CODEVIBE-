import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transporter from environment variables.
 * Supports any SMTP provider: Gmail, SendGrid, Resend, Mailtrap, etc.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // true for SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Sends a password reset email to the user.
 *
 * @param {string} toEmail    - Recipient email address
 * @param {string} resetURL   - Full reset link including the token
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (toEmail, resetURL) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"CodeVibe" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your CodeVibe password',
    text: `
You requested a password reset for your CodeVibe account.

Click the link below to set a new password. This link is valid for 15 minutes.

${resetURL}

If you did not request this, please ignore this email. Your password will remain unchanged.

— The CodeVibe Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:10px;overflow:hidden;
                      box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:28px 36px;">
              <h1 style="margin:0;color:#e94560;font-size:24px;
                         letter-spacing:1px;">CodeVibe</h1>
              <p style="margin:4px 0 0;color:#a0aec0;font-size:13px;">
                Learn. Code. Grow.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 24px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">
                Password Reset Request
              </h2>
              <p style="margin:0 0 12px;color:#4a5568;font-size:15px;line-height:1.6;">
                We received a request to reset the password for your CodeVibe account.
                Click the button below to choose a new password.
              </p>
              <p style="margin:0 0 28px;color:#718096;font-size:13px;">
                This link is valid for <strong>15 minutes</strong>. After that,
                you'll need to request a new one.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:6px;background:#e94560;">
                    <a href="${resetURL}"
                       style="display:inline-block;padding:14px 32px;
                              color:#ffffff;font-size:15px;font-weight:bold;
                              text-decoration:none;letter-spacing:0.5px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;color:#718096;font-size:13px;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:6px 0 0;word-break:break-all;">
                <a href="${resetURL}"
                   style="color:#e94560;font-size:13px;">${resetURL}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 28px;border-top:1px solid #edf2f7;">
              <p style="margin:0;color:#a0aec0;font-size:12px;line-height:1.6;">
                If you did not request a password reset, you can safely ignore this email.
                Your password will not change unless you click the link above.
              </p>
              <p style="margin:10px 0 0;color:#a0aec0;font-size:12px;">
                © ${new Date().getFullYear()} CodeVibe. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
};
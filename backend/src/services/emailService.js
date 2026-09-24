const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter = null;

function isSmtpConfigured() {
  const { host, user, pass, fromEmail } = env.smtp;
  return Boolean(host && user && pass && fromEmail);
}

function getTransporter() {
  if (!isSmtpConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }
  return transporter;
}

const OTP_PURPOSE = {
  signup: "signup",
  passwordReset: "password_reset",
};

/**
 * Sends a 6-digit code by email (signup verification or password reset).
 * @param {string} email
 * @param {string} code
 * @param {"signup"|"password_reset"} [purpose]
 */
async function sendOTPEmail(email, code, purpose = OTP_PURPOSE.signup) {
  const isReset = purpose === OTP_PURPOSE.passwordReset;
  const subject = isReset
    ? `Security Code for Password Reset: ${code}`
    : `Security Verification Code: ${code}`;
  const text = isReset
    ? `Your Horizoneinvest security code is: ${code}. It is valid for 10 minutes.`
    : `Your Horizoneinvest verification code is: ${code}. It is valid for 10 minutes.`;
  const html = isReset
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Password Reset Code</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.5;">You requested a password reset for your Horizoneinvest account. Use the code below to proceed:</p>
        <div style="background: #f8fafc; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #4d6928;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Horizoneinvest</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #4d6928; margin-top: 0; font-size: 20px;">Welcome to Horizoneinvest</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.5;">Use the code below to verify your account:</p>
        <div style="background: #f8fafc; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #4d6928;">${code}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Horizoneinvest</p>
      </div>
    `;

  const mailOptions = {
    from: `"Horizoneinvest Support" <${env.smtp.fromEmail}>`,
    to: email,
    subject,
    text,
    html,
  };

  const mailer = getTransporter();
  if (!mailer) {
    throw new Error("SMTP is not configured");
  }
  return mailer.sendMail(mailOptions);
}

async function verifySmtpConnection() {
  const mailer = getTransporter();
  if (!mailer) return false;
  await mailer.verify();
  return true;
}

module.exports = {
  sendOTPEmail,
  verifySmtpConnection,
  isSmtpConfigured,
  OTP_PURPOSE,
};

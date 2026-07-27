const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined
});

async function sendMail({ to, subject, html }) {
  try {
    await transporter.sendMail({ from: env.smtp.from, to, subject, html });
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
  }
}

function verificationEmailTemplate(name, link) {
  return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2 style="color:#0d6efd;">Welcome to DeenByte Digital Services</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Please verify your email address to activate your account:</p>
      <p><a href="${link}" style="background:#0d6efd;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Verify Email</a></p>
      <p>Or copy this link: ${link}</p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;
}

function resetPasswordEmailTemplate(name, link) {
  return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2 style="color:#0d6efd;">Password Reset Request</h2>
      <p>Hi ${name || 'there'},</p>
      <p>We received a request to reset your password. Click below to set a new one:</p>
      <p><a href="${link}" style="background:#0d6efd;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
    </div>
  `;
}

module.exports = { sendMail, verificationEmailTemplate, resetPasswordEmailTemplate };

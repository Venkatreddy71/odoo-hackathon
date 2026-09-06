const nodemailer = require('nodemailer');

/**
 * Email Service — Sends real emails via SMTP (Gmail / Any provider).
 * Falls back gracefully to console logging if SMTP credentials are not configured.
 */

let transporter = null;

const initTransporter = () => {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);

  if (!smtpUser || !smtpPass) {
    console.warn('[EmailService] ⚠️  SMTP credentials not configured. Emails will be logged but not sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  console.log(`[EmailService] ✅ SMTP transporter initialized (${smtpUser} via ${smtpHost}:${smtpPort})`);
  return transporter;
};

/**
 * Send an email. If SMTP is not configured, logs the email to console instead.
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - Optional HTML body
 * @returns {Promise<{success: boolean, messageId?: string, fallback?: boolean}>}
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const mailer = initTransporter();

  if (!mailer) {
    // Fallback: Log to console when SMTP is not configured
    console.log('─'.repeat(60));
    console.log('[EmailService] 📧 SIMULATED EMAIL DISPATCH');
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:\n${text}`);
    console.log('─'.repeat(60));
    return { success: true, fallback: true };
  }

  try {
    const fromName = process.env.SMTP_FROM_NAME || 'PeoplePay360 HR';
    const fromEmail = process.env.SMTP_USER;

    const info = await mailer.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html: html || undefined,
    });

    console.log(`[EmailService] ✅ Email sent to ${to} — MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] ❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send account credentials email to a new employee.
 */
const sendCredentialsEmail = async ({ to, workEmail, password, role, employeeName }) => {
  const subject = '🎉 Welcome to PeoplePay360 — Your Account Login Credentials';

  const text = `
Hello${employeeName ? ` ${employeeName}` : ''},

Welcome to PeoplePay360! Your account has been provisioned by the HR team.

Here are your login credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔹 Login URL:  ${process.env.CLIENT_URL || 'http://localhost:5173'}
  🔹 Email:      ${workEmail}
  🔹 Password:   ${password}
  🔹 Role:       ${role}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please log in and change your password at your earliest convenience.

If you did not expect this email, please contact your HR department immediately.

Best regards,
PeoplePay360 HR Team
  `.trim();

  const html = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">PeoplePay360</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Welcome to the Team! 🎉</p>
  </div>
  <div style="padding: 32px 24px; color: #e2e8f0;">
    <p style="font-size: 15px; margin: 0 0 20px;">Hello${employeeName ? ` <strong>${employeeName}</strong>` : ''},</p>
    <p style="font-size: 14px; margin: 0 0 24px; line-height: 1.6;">Your account has been provisioned by the HR team. Use the credentials below to access your employee portal.</p>
    
    <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; width: 120px;">🌐 Login URL</td>
          <td style="padding: 8px 0;"><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="color: #818cf8; text-decoration: none; font-weight: 600;">${process.env.CLIENT_URL || 'http://localhost:5173'}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">📧 Email</td>
          <td style="padding: 8px 0; color: #ffffff; font-weight: 600;">${workEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">🔑 Password</td>
          <td style="padding: 8px 0; color: #f59e0b; font-family: monospace; font-weight: 700; font-size: 16px; letter-spacing: 1px;">${password}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8;">🎭 Role</td>
          <td style="padding: 8px 0; color: #a78bfa; font-weight: 600;">${role}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">⚠️ Please change your password after your first login.</p>
    <p style="font-size: 13px; color: #64748b; margin: 0;">If you did not expect this email, contact your HR department immediately.</p>
  </div>
  <div style="background: #1e293b; padding: 16px 24px; text-align: center; border-top: 1px solid #334155;">
    <p style="margin: 0; font-size: 12px; color: #475569;">© 2026 PeoplePay360 — Enterprise HR & Payroll Platform</p>
  </div>
</div>
  `.trim();

  return sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendCredentialsEmail,
};

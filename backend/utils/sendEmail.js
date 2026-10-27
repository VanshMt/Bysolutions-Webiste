const nodemailer = require('nodemailer');

/**
 * Safely HTML-escapes user-controlled text strings to prevent HTML injection in emails.
 * @param {string} str - Raw input string
 * @returns {string} HTML-escaped string
 */
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Creates and configures a Nodemailer transport using environment variables.
 */
const getTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.zoho.in',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Sends a notification email to the company regarding a new contact/quote submission.
 * @param {Object} contactData - Saved contact document or data object
 */
const sendCompanyNotification = async (contactData) => {
  const recipient = process.env.COMPANY_EMAIL || process.env.EMAIL_USER;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !recipient) {
    throw new Error('Email configuration environment variables are missing');
  }

  const transporter = getTransporter();
  const submissionType = contactData.type === 'quote' ? 'Quote Request' : 'Contact Enquiry';
  const submissionDate = contactData.createdAt
    ? new Date(contactData.createdAt).toLocaleString('en-US', { timeZone: 'UTC' })
    : new Date().toLocaleString('en-US', { timeZone: 'UTC' });

  // Safely escape user-controlled fields for HTML template insertion
  const safeFullName = escapeHtml(contactData.fullName);
  const safeEmail = escapeHtml(contactData.email);
  const safePhone = escapeHtml(contactData.phone || 'N/A');
  const safeService = escapeHtml(contactData.service || 'N/A');
  const safeType = escapeHtml(contactData.type || 'contact');
  const safeSubmissionType = escapeHtml(submissionType);
  const safeMessage = escapeHtml(contactData.message).replace(/\n/g, '<br />');

  const mailOptions = {
    from: `"BY Solutions Web" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: `[BY Solutions] New ${submissionType} from ${contactData.fullName}`,
    text: `
You have received a new ${submissionType} on the BY Solutions website.

Submission Details:
----------------------------------------
Full Name: ${contactData.fullName}
Email: ${contactData.email}
Phone: ${contactData.phone || 'N/A'}
Service Requested: ${contactData.service || 'N/A'}
Submission Type: ${contactData.type || 'contact'}
Date/Time: ${submissionDate} UTC

Message:
${contactData.message}
----------------------------------------
    `.trim(),
    html: `
      <h2>New ${safeSubmissionType} Received</h2>
      <p>A new form submission has been received on the BY Solutions website.</p>
      <hr />
      <h3>Submission Details:</h3>
      <ul>
        <li><strong>Full Name:</strong> ${safeFullName}</li>
        <li><strong>Email:</strong> ${safeEmail}</li>
        <li><strong>Phone:</strong> ${safePhone}</li>
        <li><strong>Service Requested:</strong> ${safeService}</li>
        <li><strong>Submission Type:</strong> ${safeType}</li>
        <li><strong>Date/Time:</strong> ${submissionDate} UTC</li>
      </ul>
      <h3>Message:</h3>
      <blockquote style="background: #f9f9f9; border-left: 4px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
        ${safeMessage}
      </blockquote>
    `
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Sends a confirmation email to the user who submitted the enquiry form.
 * @param {Object} contactData - Saved contact document or data object
 */
const sendCustomerConfirmation = async (contactData) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration environment variables are missing');
  }

  const transporter = getTransporter();
  const safeFullName = escapeHtml(contactData.fullName);

  const mailOptions = {
    from: `"BY Solutions" <${process.env.EMAIL_USER}>`,
    to: contactData.email,
    subject: 'Thank you for contacting BY Solutions',
    text: `
Dear ${contactData.fullName},

Thank you for reaching out to BY Solutions. We have received your enquiry and our team will review it and get back to you shortly.

Best regards,
BY Solutions Team
    `.trim(),
    html: `
      <h2>Thank You for Contacting BY Solutions</h2>
      <p>Dear ${safeFullName},</p>
      <p>Thank you for reaching out to us. We have successfully received your enquiry and our team will review your message and get back to you as soon as possible.</p>
      <br />
      <p>Best regards,</p>
      <p><strong>BY Solutions Team</strong></p>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendCompanyNotification,
  sendCustomerConfirmation
};

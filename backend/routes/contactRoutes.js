const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const validateContact = require('../middleware/validateContact');
const contactRateLimiter = require('../middleware/rateLimiter');
const { sendCompanyNotification, sendCustomerConfirmation } = require('../utils/sendEmail');

/**
 * @route   POST /api/contact
 * @desc    Submit a contact enquiry or quote request
 * @access  Public
 */
router.post(
  '/',
  contactRateLimiter,
  validateContact,
  async (req, res, next) => {
    try {
      const { fullName, companyName, email, phone, service, message, type } = req.body;

      // Save submission to MongoDB with default status 'new'
      const newContact = await Contact.create({
        fullName,
        companyName,
        email,
        phone,
        service,
        message,
        type: type || 'contact',
        status: 'new'
      });

      // Attempt to send company notification email; log error if sending fails
      try {
        await sendCompanyNotification(newContact);
      } catch (emailErr) {
        console.error(`Company notification email failed: ${emailErr.message}`);
      }

      // Attempt to send customer confirmation email; log error if sending fails
      try {
        await sendCustomerConfirmation(newContact);
      } catch (emailErr) {
        console.error(`Customer confirmation email failed: ${emailErr.message}`);
      }

      return res.status(201).json({
        success: true,
        message: 'Your enquiry has been submitted successfully.',
        data: {
          id: newContact._id
        }
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;

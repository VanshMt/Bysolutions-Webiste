const { body, validationResult } = require('express-validator');

/**
 * Validation rules for contact form submissions.
 */
const validateContactRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('companyName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Company name cannot exceed 150 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false })
    .isLength({ max: 254 })
    .withMessage('Email address cannot exceed 254 characters'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),

  body('service')
    .optional({ checkFalsy: true })
    .trim()
    .isIn([
      'Enterprise Hardware',
      'Cloud Migration',
      'Cybersecurity',
      'Networking',
      'Refurbished IT',
      'Other'
    ])
    .withMessage('Please select a valid service option from the list'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Message must be between 5 and 2000 characters'),

  body('type')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(['contact', 'quote'])
    .withMessage('Type must be either "contact" or "quote"')
];

/**
 * Middleware handler to validate request input and return structured error response on failure.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = [...validateContactRules, handleValidationErrors];

const { body, query, param, validationResult } = require('express-validator');

/**
 * Check validation results and return errors
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
}

/**
 * Phone validation rules
 */
const phoneRules = [
  body('phone')
    .trim()
    .escape()
    .matches(/^\+91\d{10}$/)
    .withMessage('Phone must be a valid Indian number starting with +91')
];

/**
 * OTP validation rules
 */
const otpRules = [
  body('phone').trim().escape().matches(/^\+91\d{10}$/).withMessage('Invalid phone number'),
  body('otp').trim().escape().isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits')
];

/**
 * Profile update validation rules
 */
const profileRules = [
  body('name').optional().trim().escape().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('role').optional().isIn(['farmer', 'worker']).withMessage('Role must be farmer or worker'),
  body('location.district').optional().trim().notEmpty(),
  body('location.village').optional().trim().notEmpty(),
  body('location.pincode').optional().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }),
  body('skills').optional().isArray()
];

/**
 * Job creation validation rules
 */
const jobRules = [
  body('title').trim().escape().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().escape().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('category').isIn(['sowing', 'harvesting', 'weeding', 'hoeing', 'irrigation', 'spraying', 'plowing', 'other'])
    .withMessage('Invalid category'),
  body('wageType').isIn(['daily', 'hourly', 'acre', 'fixed']).withMessage('Invalid wage type'),
  body('wageAmount').toFloat().isFloat({ min: 1 }).withMessage('Wage must be a positive number'),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Location coordinates must be [lon, lat]'),
  body('startDate').notEmpty().withMessage('Start date required'),
  body('workersNeeded').toInt().isInt({ min: 1 }).withMessage('At least 1 worker needed')
];

/**
 * Nearby jobs query validation
 */
const nearbyRules = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius').optional().isFloat({ min: 1, max: 200 }).withMessage('Radius must be 1-200 km')
];

/**
 * Rating validation rules
 */
const ratingRules = [
  body('score').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('review').optional().trim().isLength({ max: 500 })
];

/**
 * MongoDB ObjectId param validation
 */
const idParamRule = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

module.exports = {
  validate,
  phoneRules,
  otpRules,
  profileRules,
  jobRules,
  nearbyRules,
  ratingRules,
  idParamRule
};

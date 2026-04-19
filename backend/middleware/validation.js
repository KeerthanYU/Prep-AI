const Joi = require('joi');
const validator = require('validator');

/**
 * Validation schemas
 */
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    displayName: Joi.string().min(2).max(50),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Firebase token-based login/register
  firebaseLogin: Joi.object({
    firebaseToken: Joi.string().required(),
    displayName: Joi.string().min(2).max(50).optional().allow('', null),
    photoURL: Joi.string().uri().allow('', null).optional(),
  }),

  profileUpdate: Joi.object({
    displayName: Joi.string().min(2).max(50),
    domain: Joi.string().valid('Software Engineering', 'Marketing', 'Finance', 'HR'),
  }),

  interview: Joi.object({
    question: Joi.string().required().max(1000),
    answer: Joi.string().required().max(5000),
    duration: Joi.number().min(0),
  }),

  resumeUpload: Joi.object({
    jobRole: Joi.string().required().max(100),
    experience: Joi.string().required().max(1000),
  }),
};

/**
 * Validate request body against schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details,
      });
    }

    // Replace body with sanitized value
    req.body = value;
    next();
  };
};

/**
 * Sanitize string input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Basic XSS prevention
  return validator.escape(input).trim();
};

/**
 * Sanitize all string fields in request body
 */
const sanitizeBody = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return next();
  }

  Object.keys(req.body).forEach((key) => {
    if (typeof req.body[key] === 'string') {
      const raw = req.body[key].trim();
      // Preserve URLs (do not escape) so Joi .uri() validation can pass
      if (validator.isURL(raw, { require_protocol: true })) {
        req.body[key] = raw;
      } else {
        req.body[key] = sanitizeInput(raw);
      }
    }
  });

  next();
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate password strength
 */
const isStrongPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 6,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  });
};

module.exports = {
  validateRequest,
  sanitizeInput,
  sanitizeBody,
  isValidEmail,
  isStrongPassword,
  schemas,
};

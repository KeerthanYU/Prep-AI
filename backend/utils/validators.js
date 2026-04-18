const { body, validationResult } = require('express-validator');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateDomain = (domain) => {
  const validDomains = ['Software Engineering', 'Marketing', 'Finance', 'HR'];
  return validDomains.includes(domain);
};

const registerValidator = [
  body('firebaseId').notEmpty().withMessage('Firebase ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

const profileUpdateValidator = [
  body('displayName').optional().notEmpty().withMessage('Display name cannot be empty'),
  body('domain').optional().custom(validateDomain).withMessage('Invalid domain'),
];

const interviewValidator = [
  body('domain').custom(validateDomain).withMessage('Invalid domain'),
];

const answerValidator = [
  body('interviewId').notEmpty().withMessage('Interview ID is required'),
  body('questionIndex').isInt({ min: 0 }).withMessage('Valid question index is required'),
  body('userAnswer').notEmpty().withMessage('Answer is required'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation error',
      details: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateEmail,
  validateDomain,
  registerValidator,
  profileUpdateValidator,
  interviewValidator,
  answerValidator,
  handleValidationErrors,
};

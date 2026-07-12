/**
 * Generic Validation Middleware using Joi
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate the request body against
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    const errorDetails = error.details.map(detail => detail.message);
    console.error(`[Validation Failed] ${req.method} ${req.originalUrl}:`, errorDetails);
    return res.status(400).json({
      message: 'Validation failed',
      errors: errorDetails
    });
  }
  next();
};

module.exports = validate;

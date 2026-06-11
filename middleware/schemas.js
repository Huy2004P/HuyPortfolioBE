const Joi = require('joi');

// Helper for MongoDB ObjectId validation
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

// Helper for multi-language Map fields (at least one key required if object is mandatory)
const localizedField = Joi.object().pattern(Joi.string(), Joi.string().allow('')).messages({
  'object.base': 'Must be an object with language keys (e.g. "en": "...", "vi": "...")'
});

// Auth Schemas
const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'Username is required',
    'string.empty': 'Username cannot be empty'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password cannot be empty'
  })
});

const setupSchema = Joi.object({
  username: Joi.string().required().min(3).messages({
    'any.required': 'Username is required',
    'string.min': 'Username must be at least 3 characters long'
  }),
  password: Joi.string().required().min(6).messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6)
});

const forgotPasswordSchema = Joi.object({
  username: Joi.string().required(),
  newPassword: Joi.string().required().min(6)
});

// Project Schema
const projectSchema = Joi.object({
  title: localizedField.min(1).required().messages({
    'any.required': 'Title map is required'
  }),
  description: localizedField.min(1).required().messages({
    'any.required': 'Description map is required'
  }),
  imageUrl: Joi.string().uri().allow('').optional(),
  screenshots: Joi.array().items(Joi.string().uri()).optional(),
  projectType: Joi.string().valid('web', 'mobile', 'game', 'other').default('web'),
  projectUrl: Joi.string().uri().allow('').optional(),
  demoUrl: Joi.string().uri().allow('').optional(),
  apkUrl: Joi.string().uri().allow('').optional(),
  videoUrl: Joi.string().uri().allow('').optional(),
  engine: Joi.string().allow('').optional(),
  platforms: Joi.array().items(Joi.string()).optional(),
  playableUrl: Joi.string().uri().allow('').optional(),
  downloadUrls: Joi.object().pattern(Joi.string(), Joi.string().uri().allow('')).optional(),
  technologies: Joi.array().items(Joi.string()).optional(),
  changelog: Joi.array().items(Joi.object({
    version: Joi.string().required(),
    date: Joi.date().optional(),
    notes: localizedField.min(1).required()
  })).optional()
});

// Post Schema
const postSchema = Joi.object({
  title: localizedField.min(1).required().messages({
    'any.required': 'Title map is required'
  }),
  slug: Joi.string().required().messages({
    'any.required': 'Slug is required'
  }),
  content: localizedField.min(1).required().messages({
    'any.required': 'Content map is required'
  }),
  excerpt: localizedField.optional(),
  coverImage: Joi.string().uri().allow('').optional(),
  category: Joi.string().valid('general', 'mobile', 'game').default('general'),
  tags: Joi.array().items(Joi.string()).optional(),
  published: Joi.boolean().optional()
});

// Profile Schema
const profileSchema = Joi.object({
  headline: localizedField.min(1).required().messages({
    'any.required': 'Headline map is required'
  }),
  subHeadline: localizedField.optional(),
  techStack: Joi.array().items(Joi.string()).optional(),
  avatarUrl: Joi.string().uri().allow('').optional(),
  socialLinks: Joi.object().pattern(Joi.string(), Joi.string().allow('')).optional()
});

// Score Schema
const scoreSchema = Joi.object({
  playerName: Joi.string().required().trim().min(2).max(30).messages({
    'any.required': 'Player name is required',
    'string.min': 'Player name must be at least 2 characters',
    'string.max': 'Player name cannot exceed 30 characters'
  }),
  projectId: objectId.required().messages({
    'any.required': 'Project ID is required'
  }),
  score: Joi.number().integer().required().min(0).messages({
    'any.required': 'Score is required',
    'number.base': 'Score must be a number',
    'number.min': 'Score cannot be negative'
  })
});

// Dictionary Schema
const dictionarySchema = Joi.object({
  key: Joi.string().required().trim().messages({
    'any.required': 'Dictionary key is required',
    'string.empty': 'Dictionary key cannot be empty'
  }),
  translations: Joi.object().pattern(Joi.string(), Joi.string().allow('')).required()
});

// Comment Schema
const commentSchema = Joi.object({
  postId: objectId.required().messages({
    'any.required': 'postId is required'
  }),
  playerName: Joi.string().required().trim().messages({
    'any.required': 'Player name is required'
  }),
  email: Joi.string().email().allow('').optional().messages({
    'string.email': 'Email must be a valid email address'
  }),
  content: Joi.string().required().messages({
    'any.required': 'Comment content is required'
  }),
  parentId: objectId.allow(null).optional(),
  status: Joi.string().valid('pending', 'approved').optional()
});

// Message Schema (Contact Form)
const messageSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address'
  }),
  subject: Joi.string().allow('').optional(),
  message: Joi.string().required().messages({
    'any.required': 'Message content is required'
  })
});

// Subscriber Schema (Newsletter)
const subscriberSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address'
  })
});

module.exports = {
  loginSchema,
  setupSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  projectSchema,
  postSchema,
  profileSchema,
  scoreSchema,
  dictionarySchema,
  commentSchema,
  messageSchema,
  subscriberSchema
};

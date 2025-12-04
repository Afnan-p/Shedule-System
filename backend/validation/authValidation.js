import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required().min(6).max(100),
  role: Joi.string().valid('admin', 'scheduler', 'teacher').default('teacher'),
  branch: Joi.string().required().trim()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().required()
});



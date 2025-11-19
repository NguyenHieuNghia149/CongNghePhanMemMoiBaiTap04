const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required().messages({
    'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  newPassword: Joi.string().min(6).max(50).required().messages({
    'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
};
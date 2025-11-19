const Joi = require("joi");

const productCreateSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().min(3).max(100).required(),
  image: Joi.string().min(3).max(100).required(),
  category: Joi.string().min(3).max(100).required(),
  brand: Joi.string().min(3).max(100).required(),
});

const productUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().min(3).max(100).required(),
  image: Joi.string().min(3).max(100).required(),
  category: Joi.string().min(3).max(100).required(),
  brand: Joi.string().min(3).max(100).required(),
});

const productDeleteSchema = Joi.object({
  id: Joi.string().required(),
});

module.exports = {
  productCreateSchema,
  productUpdateSchema,
  productDeleteSchema,
};

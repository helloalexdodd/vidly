const mongoose = require('mongoose');
const Joi = require('joi');

exports.Customer = mongoose.model(
  'Customer',
  new mongoose.Schema({
    isGold: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10,
    },
  })
);

exports.validate = (req) => {
  const schema = Joi.object({
    isGold: Joi.boolean(),
    name: Joi.string().required(),
    phone: Joi.string().min(10).max(10).required(),
  });
  return schema.validate(req);
};

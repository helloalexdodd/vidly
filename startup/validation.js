//could be renamed api.js
const Joi = require('joi');

module.exports = () => {
  Joi.objectId = require('joi-objectid')(Joi);
};

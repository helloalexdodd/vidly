const mongoose = require('mongoose');
const Joi = require('joi');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    isRequired: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
  },
});

const Genre = mongoose.model('Genre', genreSchema);

const validate = (req) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });
  return schema.validate(req);
};

module.exports = {
  genreSchema,
  Genre,
  validate,
};

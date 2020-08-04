const mongoose = require('mongoose');
const Joi = require('joi');
const { genreSchema } = require('./genre');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 255,
  },
  genre: {
    type: genreSchema,
    required: true,
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 999999,
    // set: (value) => Math.round(value),
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    default: 2,
    min: 0,
    max: 999999,
    // set: (value) => value.toFixed(2),
  },
});

const Movie = mongoose.model('Movie', movieSchema);

const validate = (req) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255),
    genreId: Joi.objectId(),
    numberInStock: Joi.number().min(0).max(999999),
    dailyRentalRate: Joi.number().min(0).max(999999),
  });
  return schema.validate(req);
};

module.exports = {
  movieSchema,
  Movie,
  validate,
};

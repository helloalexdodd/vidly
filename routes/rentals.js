const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Fawn = require('fawn');
const auth = require('../middleware/auth');

const { Rental, validate } = require('../models/rentals');
const { Movie } = require('../models/movies');
const { Customer } = require('../models/customer');

Fawn.init(mongoose);

router.get('/', async (req, res) => {
  const rentals = await Movie.find().sort('-dateOut');
  if (!rentals) return res.status(404).send('No rentals found');
  res.status(200).send(rentals);
});

router.post('/', auth, async (req, res) => {
  const { customerId, movieId } = req.body;
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const { _id, name, phone } = await Customer.findById(customerId);
  if (!customer) return res.status(400).send('Invalid customer');

  const { id, title, dailyRentalRate } = await Movie.findById(movieId);
  if (!movie) return res.status(400).send('Invalid movie');

  if (movie.numberInStock === 0)
    return res.status(400).send('Movie not in stock');

  const rental = new Rental({
    customer: { _id, name, phone },
    movie: { _id: id, title, dailyRentalRate },
  });

  try {
    new Fawn.Task()
      .save('rentals', rental)
      .update('movies', { _id }, { $inc: { numberInStock: -1 } })
      .run();

    res.status(200).send(rental);
  } catch (err) {
    res.status(500).send('Internal Server Error: ', error.message);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Rental, validate } = require('../models/rentals');
const { Movie } = require('../models/movies');
const auth = require('../middleware/auth');
const joiValidator = require('../middleware/validate');

router.post('/', [auth, joiValidator(validate)], async (req, res) => {
  const { customerId, movieId } = req.body;

  const rental = await Rental.lookup(customerId, movieId);

  if (!rental) return res.status(404).send('Rental not found');
  if (rental.dateReturned)
    return res.status(400).send('Rental already returned');

  await rental.return();
  await rental.save();

  await Movie.update({ _id: rental.movie._id }, { $inc: { numberInStock: 1 } });

  res.send(rental);
});

module.exports = router;

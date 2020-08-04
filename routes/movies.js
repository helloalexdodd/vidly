const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { Movie, validate } = require('../models/movies');
const { Genre } = require('../models/genre');

router.get('/', async (req, res) => {
  const movies = await Movie.find().sort('title');
  if (!movies) return res.status(404).send('No movies found');

  res.status(200).send(movies);
});

router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).send('Movie not found');

  res.status(200).send(movie);
});

router.post('/', auth, async (req, res) => {
  const { title, genreId, numberInStock, dailyRentalRate } = req.body;
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const { _id, name } = await Genre.findById(genreId);
  if (!genre) return res.status(400).send('Invalid genre');

  movie = new Movie({
    title,
    genre: { _id, name },
    numberInStock,
    dailyRentalRate,
  });

  try {
    await movie.save();
    res.status(200).send(movie);
  } catch (err) {
    for (field in err.errors) {
      res.status(404).send(`Error: ${err.errors[field].message}`);
    }
  }
});

router.put('/:id', auth, async (req, res) => {
  const { title, genreId, numberInStock, dailyRentalRate } = req.body;
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { title, genre, numberInStock, dailyRentalRate },
    { new: true }
  );
  if (!movie) return res.status(404).send('Movie not found');

  res.status(200).send(movie);
});

router.delete('/:id', auth, async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);
  if (!movie) return res.status(404).send('Movie not found');
  res.send(movie);
});

module.exports = router;

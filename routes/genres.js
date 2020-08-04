const express = require('express');
const router = express.Router();
const { Genre, validate } = require('../models/genre');
const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const joiValidator = require('../middleware/validate');

router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name');
  if (!genres.length) return res.status(404).send('No genres found');
  res.status(200).send(genres);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send('Genre not found');

  res.status(200).send(genre);
});

router.post('/', [auth, joiValidator(validate)], async (req, res) => {
  const { name } = req.body;

  const genre = new Genre({ name });

  await genre.save();
  res.status(200).send(genre);
});

router.put(
  '/:id',
  [auth, validateObjectId, joiValidator(validate)],
  async (req, res) => {
    const { name } = req.body;

    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!genre) return res.status(404).send('Genre not found');

    res.status(200).send(genre);
  }
);

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(404).send('Genre not found');
  res.send(genre);
});

module.exports = router;

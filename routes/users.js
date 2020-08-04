const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

const { User, validate } = require('../models/user');

router.get('/me', auth, async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id).select('-password');
  res.send(user);
});

router.post('/', async (req, res) => {
  const { email, name, password } = req.body;
  const { error } = await validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let user = await User.findOne({ email });
  if (user) return res.status(400).send('User already registered');

  user = new User({ name, email, password });

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(password, salt);

  const { _id } = await user.save();
  const token = user.generateAuthToken();
  res.header('x-auth-token', token).status(200).send({ _id, name, email });
});

module.exports = router;

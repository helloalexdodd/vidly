const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const { User } = require('../models/user');

const validate = (req) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: passwordComplexity(),
  });
  return schema.validate(req);
};

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  const { error } = await validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  let user = await User.findOne({ email });
  if (!user) return res.status(400).send('Invalid email');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).send('Invalid email or password');
  const token = user.generateAuthToken();
  res.send(token);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { Customer, validate } = require('../models/customer');

router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name');
  if (!customers) return res.status(404).send('No customers found');

  res.status(200).send(customers);
});

router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).send('Customer not found');

  res.status(200).send(customer);
});

router.post('/', auth, async (req, res) => {
  const { isGold, name, phone } = req.body;
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const customer = new Customer({ isGold, name, phone });

  try {
    await customer.save();
    res.status(200).send(customer);
  } catch (err) {
    for (field in err.errors) {
      res.status(404).send(`Error: ${err.errors[field].message}`);
    }
  }
});

router.put('/:id', auth, async (req, res) => {
  const { isGold, name, phone } = req;
  const { error } = validate(req.body);
  if (error) return res.status(404).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { isGold, name, phone },
    { new: true }
  );
  if (!customer) return res.status(404).send('Customer not found');

  res.status(200).send(customer);
});

router.delete('/:id', auth, async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);
  if (!customer) return res.status(404).send('Customer not found');
  res.send(customer);
});

module.exports = router;

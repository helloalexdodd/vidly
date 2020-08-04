const winston = require('winston');
const { info, verbose, silly } = require('winston');

module.exports = (err, req, res, next) => {
  // error
  // warn
  // info
  // verbose
  // debug
  // silly

  // winston.log('error', err.message);
  winston.error(err.message, err);

  res
    .status(500)
    .send(
      'Our bad! Something went wrong on our end. Maybe try again later? 🤷🏻‍♂️'
    );
};

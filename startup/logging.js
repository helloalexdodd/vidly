const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

const options = {
  file: {
    level: 'info',
    filename: '../winston.json',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    prettyPrint: true,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    prettyPrint: true,
  },
};

module.exports = () => {
  // TODO check how to update winston, and see if handleExceptions handles unhandledRejections in newer versions.
  winston.handleExceptions(
    new winston.transports.Console(options.console),
    new winston.transports.File(options.file)
  );

  process.on('unhandledRejection', (ex) => {
    throw ex;
  });

  winston.add(winston.transports.File, options.file);
  winston.add(winston.transports.MongoDB, {
    db: 'mongodb://localhost/vidly',
    level: 'error',
  });
};

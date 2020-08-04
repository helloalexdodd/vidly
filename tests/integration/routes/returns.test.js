const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');
const { Rental } = require('../../../models/rentals');
const { User } = require('../../../models/user');
const { Movie } = require('../../../models/movies');

describe('/api/returns', () => {
  let server;
  let customerId;
  let movieId;
  let movie;
  let rental;
  let token;

  beforeEach(async () => {
    server = require('../../../index');
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    token = User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: 'movieTitle1',
      genre: {
        name: 'genre1',
      },
      numberInStock: 10,
      dailyRentalRate: 2,
    });
    await movie.save();

    rental = new Rental({
      customer: {
        name: 'a',
        phone: '0000000000',
        _id: customerId,
      },
      movie: {
        _id: movieId,
        title: 'aa',
        dailyRentalRate: 2,
      },
    });
    await rental.save();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
    await Movie.deleteMany({});
    await server.close();
  });

  const exec = () => {
    return request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });
  };

  it('should return a 401 if client is not logged in', async () => {
    token = '';
    const res = await exec(server);
    expect(res.status).toBe(401);
  });

  it('should return a 400 if valid customer id is not provided', async () => {
    customerId = '';
    const res = await exec(server);
    expect(res.status).toBe(400);
  });

  it('should return a 400 if valid movie id is not provided', async () => {
    movieId = '';
    const res = await exec(server);
    expect(res.status).toBe(400);
  });

  it('should return 404 if no rental found for given customerId/movieId', async () => {
    await Rental.deleteMany({});
    const res = await exec();
    expect(res.status).toBe(404);
  });

  it('should return 400 if rental already processed', async () => {
    rental.dateReturned = Date.now();
    await rental.save();
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 200 if this is a valid request', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it('should set the return date if input is valid', async () => {
    await exec();
    const rentalInDb = await Rental.findById(rental._id);
    const diff = Date.now() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should calculate the rental fee if input is valid', async () => {
    rental.dateOut = moment().subtract(7, 'days').toDate();
    await rental.save();
    await exec();
    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBe(14);
  });

  it('should increase the stock of the movie if input is valid', async () => {
    const res = await exec(server);
    const movieInDb = await Movie.findById(movieId);
    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it('should return the summary of the rental to client if input is valid', async () => {
    const res = await exec();
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        'dateOut',
        'dateReturned',
        'rentalFee',
        'customer',
        'movie',
      ])
    );
  });
});

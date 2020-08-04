const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const { Genre } = require('../../../models/genre');
const { User } = require('../../../models/user');

let server;

describe('/api/genres', () => {
  beforeEach(() => (server = require('../../../index')));

  afterEach(async () => {
    await Genre.deleteMany({});
    await server.close();
  });

  describe('GET /', () => {
    it('should return all genres', async () => {
      await Genre.collection.insertMany([
        { name: 'genre1' },
        { name: 'genre2' },
      ]);
      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((genre) => genre.name === 'genre1')).toBeTruthy();
      expect(res.body.some((genre) => genre.name === 'genre2')).toBeTruthy();
    });

    it('should return a 404 if no genres are found', async () => {
      await Genre.deleteMany({});
      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /:id', () => {
    it('should return a genre if valid id is passed', async () => {
      const genre = await Genre({ name: 'genre1' });
      await genre.save();
      const res = await request(server).get(`/api/genres/${genre._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });

    it('should return a 404 if invalid id is passed', async () => {
      const res = await request(server).get(`/api/genres/1`);
      expect(res.status).toBe(404);
    });

    it('should return a 404 if no genre with the given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get(`/api/genres/${id}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let name;

    const exec = () => {
      return request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name });
    };

    beforeEach(() => {
      token = User().generateAuthToken();
      name = 'genre1';
    });

    it('should return a 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return a 400 if genre is less than 3 characters', async () => {
      name = 'a';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return a 400 if genre is more than 50 characters', async () => {
      name = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      await exec();
      const genre = await Genre.find({ name: 'genre1' });
      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });

  describe('PUT /', () => {
    let token;
    let newName;
    let genre;
    let id;

    const exec = () => {
      return request(server)
        .put(`/api/genres/${id}`)
        .set('x-auth-token', token)
        .send({ name: newName });
    };

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' });
      await genre.save();

      token = User().generateAuthToken();
      id = genre._id;
      newName = 'updatedName';
    });

    it('should return a 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return a 400 if genre is less than 3 characters', async () => {
      newName = 'a';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return a 400 if genre is more than 50 characters', async () => {
      newName = new Array(52).join('a');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return a 404 if invalid id is passed', async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return a 404 if no genre with the given id was found', async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should update the matching genre if id is valid', async () => {
      await exec();
      const updatedGenre = await Genre.findById(genre._id);

      expect(updatedGenre.name).toBe(newName);
    });

    it('should return the updated genre if it is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', newName);
    });
  });

  describe('DELETE /', () => {
    let token;
    let genre;
    let id;

    const exec = () => {
      return request(server)
        .delete(`/api/genres/${id}`)
        .set('x-auth-token', token)
        .send();
    };

    beforeEach(async () => {
      genre = new Genre({ name: 'genre1' });
      await genre.save();

      id = genre._id;
      token = User({ isAdmin: true }).generateAuthToken();
    });

    it('should return a 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return a 403 if user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it('should return a 404 if invalid id is passed', async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return a 404 if no genre with the given id was found', async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should delete the genre if input is valid', async () => {
      await exec();
      const genre = await Genre.findById(id);
      expect(genre).toBeNull();
    });

    it('should return the removed genre', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id', genre._id.toHexString());
      expect(res.body).toHaveProperty('name', genre.name);
    });
  });
});

import request from 'supertest';
import app from './app.js';
import { expect } from 'chai';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should respond with json', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('ok', true);
          done();
        });
    });
  });

  describe('GET /campaigns', () => {
    it('should respond with an array of campaigns', (done) => {
      request(app)
        .get('/campaigns')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });
});

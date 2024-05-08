const app = require('../appTest')
const request = require('supertest');
var assert = require('assert')
const { dbConnect, dbDisconnect } = require('../mongoDBConfigTest')

beforeEach(function(done) { 
    dbConnect()
        .then(() => done())
        .catch(err => done(err))
})

afterEach(function(done) { 
    dbDisconnect()
        .then(() => done())
        .catch(err => done(err))
})

describe('/register', function () {
    it('should allow user with valid user input to create an account', function (done) {
        request(app)
            .post('/register')
            .send({ username: 'tao', email: 'tao@gmail.com', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(function (res) {
                assert(res.body.token != undefined)
            })
            .end(done)
    })
})
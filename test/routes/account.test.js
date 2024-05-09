const app = require('../appTest')
const request = require('supertest');
var assert = require('assert')
const { dbConnect, dbDisconnect } = require('../mongoDBConfigTest')

// Chai is a ESM, so can't use 'require()'
before(async () => {
    const { expect } = await import('chai')
    global.expect = expect
})


describe('/register', function () {
    before(function(done) { 
        dbConnect()
            .then(() => done())
            .catch(err => done(err))
    })

    after(function(done) { 
        dbDisconnect()
            .then(() => done())
            .catch(err => done(err))
    })

    it('should allow user with valid user input to create an account', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'tao', email: 'tao@gmail.com', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(200)
    
        expect(response.body).to.have.property('token').that.is.a('string').and.has.length.greaterThan(1)
    })
    

    it('should reject too short usernames', function (done) {
        request(app)
            .post('/register')
            .send({ username: '', email: 'emma@gmail.com', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end(done)
    })

    it('should reject too long usernames', function (done) {
        request(app)
            .post('/register')
            .send({ username: 'superLongUsernameWhichIsWayTooLongButIsItTooLongThoughNoItsWithoutADoubtTooLong', email: 'joe@gmail.com', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end(done)
    })

    it('should reject username that is already registered to another user', function (done) {
        request(app)
            .post('/register')
            // user with username 'tao' was registered in previous unit test
            .send({ username: 'tao', email: 'cookieBoy@gmail.com', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end(done)
    })

    it('should reject invalid email', function (done) {
        request(app)
            .post('/register')
            .send({ username: 'lo', email: 'lo1234', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end(done)
    })

    it('should reject email that is already registered to another user', function (done) {
        request(app)
            .post('/register')
            // user with email 'tao@gmail.com' was registered in previous unit test
            .send({ username: 'cookie', email: 'tao@gmail.com', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end(done)
    })

    it('should reject too short passwords', function (done) {
        request(app)
            .post('/register')
            .send({ username: 'watson', email: 'watson@gmail.com', password: 'wat' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end(done)
    })

    it('should reject too long passwords', function (done) {
        request(app)
            .post('/register')
            .send({ username: 'clark', email: 'clark@gmail.com', password: 'waaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaatsonAndClaaaaaaaaaaaaaaaark' })
            .expect('Content-Type', /json/)
            .expect(400)
            .end(done)
    })
})
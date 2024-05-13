const app = require('../appTest')
const request = require('supertest');
var assert = require('assert')
const { dbConnect, dbDisconnect } = require('../mongoDBConfigTest')
const NUMERIC_CONSTANTS = require('../../constants/numericConstants')
const ERROR_MESSAGES = require('../../constants/errorMessages')

// Chai is a ESM, so can't use 'require()'
before(async () => {
    const { expect } = await import('chai')
    global.expect = expect
})


describe('/register', function () {
    beforeEach(async () => {
        await dbConnect()
    })
    
    afterEach(async () => {
        await dbDisconnect()
    })    

    const validUser = {
        username: 'emma',
        email: 'emma@hotmail.com',
        password: 'emma1234'
    }

    it('should allow user with valid user input to create an account', async () => {
        const response = await request(app)
            .post('/register')
            .send(validUser)
            .expect('Content-Type', /json/)
            .expect(200)

        expect(response.body).to.have.property('token').that.is.a('string').and.has.length.greaterThan(1)
    })

    it('should reject username that is 1 character bellow the min username length', async () => {
        const tooShortUsername = 'a'.repeat(NUMERIC_CONSTANTS.USERNAME.MIN_LENGTH - 1)

        const response = await request(app)
            .post('/register')
            .send({ username: tooShortUsername, email: validUser.email, password: validUser.password })
            .expect('Content-Type', /json/)
            .expect(400)

            expect(response.body).to.have.property('username').that.is.an('object')
            expect(response.body.username).to.have.property('msg').that.is.a('string')
            expect(response.body.username.msg).to.equal(ERROR_MESSAGES.USERNAME_LENGTH)
    })

    it('should reject too long usernames', async () => {
        await request(app)
            .post('/register')
            .send({ username: 'superLongUsernameWhichIsWayTooLongButIsItTooLongThoughNoItsWithoutADoubtTooLong', email: 'joe@gmail.com', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(400)
    })
    
    it('should reject username that is already registered to another user', async () => {
        await request(app)
            .post('/register')
            .send({ username: 'tao', email: 'cookieBoy@gmail.com', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(400)
    })
    
    it('should reject invalid email', async () => {
        await request(app)
            .post('/register')
            .send({ username: 'lo', email: 'lo1234', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(400)
    })
    
    it('should reject email that is already registered to another user', async () => {
        await request(app)
            .post('/register')
            .send({ username: 'cookie', email: 'tao@gmail.com', password: 'password' })
            .expect('Content-Type', /json/)
            .expect(400)
    })
    
    it('should reject too short passwords', async () => {
        await request(app)
            .post('/register')
            .send({ username: 'watson', email: 'watson@gmail.com', password: 'wat' })
            .expect('Content-Type', /json/)
            .expect(400)
    })
    
    it('should reject too long passwords', async () => {
        await request(app)
            .post('/register')
            .send({ username: 'clark', email: 'clark@gmail.com', password: 'waaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaatsonAndClaaaaaaaaaaaaaaaark' })
            .expect('Content-Type', /json/)
            .expect(400)
    })    
})
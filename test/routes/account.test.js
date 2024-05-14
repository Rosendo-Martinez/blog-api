const app = require('../appTest')
const request = require('supertest');
var assert = require('assert')
const { dbConnect, dbDisconnect } = require('../mongoDBConfigTest')
const NUMERIC_CONSTANTS = require('../../constants/numericConstants')
const ERROR_MESSAGES = require('../../constants/errorMessages')
const { createUser } = require('../../services/userServices')
const { generateUserToken } = require('../../utils/jwtUtils')

// Chai is a ESM, so can't use 'require()'
before(async () => {
    const { expect } = await import('chai')
    global.expect = expect
})

const VALID_USERS = {
    EMMA: {
        username: 'emma',
        email: 'emma@hotmail.com',
        password: 'emma1234'
    },
    WATSON: {
        username: "watson",
        email: "watson@gmail.com",
        password: "watson1234"
    }
}

describe('/register', function () {
    beforeEach(async () => {
        await dbConnect()
    })
    
    afterEach(async () => {
        await dbDisconnect()
    })    

    const EMMA = VALID_USERS.EMMA
    const WATSON = VALID_USERS.WATSON

    it('should allow user with valid user input to create an account', async () => {
        const response = await request(app)
            .post('/register')
            .send(EMMA)
            .expect('Content-Type', /json/)
            .expect(200)

        expect(response.body).to.have.property('token').that.is.a('string').and.has.length.greaterThan(1)
    })

    it('should reject username that is 1 character bellow the min username length', async () => {
        const tooShortUsername = 'a'.repeat(NUMERIC_CONSTANTS.USERNAME.MIN_LENGTH - 1)

        const response = await request(app)
            .post('/register')
            .send({ username: tooShortUsername, email: EMMA.email, password: EMMA.password })
            .expect('Content-Type', /json/)
            .expect(400)

            expect(response.body).to.have.property('username').that.is.an('object')
            expect(response.body.username).to.have.property('msg').that.is.a('string')
            expect(response.body.username.msg).to.equal(ERROR_MESSAGES.USERNAME_LENGTH)
    })

    it('should reject username that is 1 character above the max username length', async () => {
        const tooLongUsername = 'Z'.repeat(NUMERIC_CONSTANTS.USERNAME.MAX_LENGTH + 1)

        const response = await request(app)
            .post('/register')
            .send({ username: tooLongUsername, email: EMMA.email, password: EMMA.password })
            .expect('Content-Type', /json/)
            .expect(400)

        expect(response.body).to.have.property('username').that.is.an('object')
        expect(response.body.username).to.have.property('msg').that.is.a('string')
        expect(response.body.username.msg).to.equal(ERROR_MESSAGES.USERNAME_LENGTH)
    })
    
    it('should reject username that is already registered to another user', async () => {
        const aRegisteredUser = await createUser(WATSON.username, WATSON.email, WATSON.password)

        const response = await request(app)
            .post('/register')
            .send({ username: aRegisteredUser.username, email: EMMA.email, password: EMMA.password })
            .expect('Content-Type', /json/)
            .expect(400)

        expect(response.body).to.have.property('username').that.is.an('object')
        expect(response.body.username).to.have.property('msg').that.is.a('string')
        expect(response.body.username.msg).to.equal(ERROR_MESSAGES.USERNAME_ALREADY_IN_USE)
    })
    
    it('should reject invalid email', async () => {
        const invalidEmail = "emma1234"

        const response = await request(app)
            .post('/register')
            .send({ username: EMMA.username, email: invalidEmail, password: EMMA.password })
            .expect('Content-Type', /json/)
            .expect(400)
        
        expect(response.body).to.have.property('email').that.is.an('object')
        expect(response.body.email).to.have.property('msg').that.is.a('string')
        expect(response.body.email.msg).to.equal(ERROR_MESSAGES.INVALID_EMAIL)
    })
    
    it('should reject email that is already registered to another user', async () => {
        const aRegisteredUser = await createUser(WATSON.username, WATSON.email, WATSON.password)

        const response = await request(app)
            .post('/register')
            .send({ username: EMMA.username, email: aRegisteredUser.email, password: EMMA.password })
            .expect('Content-Type', /json/)
            .expect(400)

        expect(response.body).to.have.property('email').that.is.an('object')
        expect(response.body.email).to.have.property('msg').that.is.a('string')
        expect(response.body.email.msg).to.equal(ERROR_MESSAGES.EMAIL_ALREADY_IN_USE)
    })
    
    it('should reject too short passwords', async () => {
        const tooShortPassword = '1'.repeat(NUMERIC_CONSTANTS.PASSWORD.MIN_LENGTH - 1)

        const response = await request(app)
            .post('/register')
            .send({ username: EMMA.username, email: EMMA.email, password: tooShortPassword })
            .expect('Content-Type', /json/)
            .expect(400)

        expect(response.body).to.have.property('password').that.is.an('object')
        expect(response.body.password).to.have.property('msg').that.is.a('string')
        expect(response.body.password.msg).to.equal(ERROR_MESSAGES.PASSWORD_LENGTH)
    })
    
    it('should reject too long passwords', async () => {
        const tooLongPassword = ' '.repeat(NUMERIC_CONSTANTS.PASSWORD.MAX_LENGTH + 1)

        const response = await request(app)
            .post('/register')
            .send({ username: EMMA.username, email: EMMA.email, password: tooLongPassword })
            .expect('Content-Type', /json/)
            .expect(400)

        expect(response.body).to.have.property('password').that.is.an('object')
        expect(response.body.password).to.have.property('msg').that.is.a('string')
        expect(response.body.password.msg).to.equal(ERROR_MESSAGES.PASSWORD_LENGTH)
    })
})

describe('/account', function() {
    describe('GET', function() {
        beforeEach(async () => {
            await dbConnect()
        })

        afterEach(async () => {
            await dbDisconnect()
        })

        it('should deny users with no authentication token', async () => {
            await request(app)
                .get('/account')
                .set('Authorization', '')
                .send({})
                .expect(401)
        })

        it('should deny users with illegal authentication token', async () => {
            const randomToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

            await request(app)
                .get('/account')
                .set('Authorization', `Bearer ${randomToken}`)
                .expect(401)
        })

        it('should deny users with legal but expired authentication token', async () => {
            const emma = await createUser(VALID_USERS.EMMA.username, VALID_USERS.EMMA.email, VALID_USERS.EMMA.password)
            const expiredToken = generateUserToken(emma._id, '-1h') // expired 1 hour ago

            await request(app)
                .get('/account')
                .set('Authorization', `Bearer ${expiredToken}`)
                .expect(401)
        })

        it('should allow request of authenticated users', async () => {
            const emma = await createUser(VALID_USERS.EMMA.username, VALID_USERS.EMMA.email, VALID_USERS.EMMA.password)
            const token = generateUserToken(emma._id, '1h')

            const response = await request(app)
                .get('/account')
                .set('Authorization', `Bearer ${token}`)
                .expect('Content-Type', /json/)
                .expect(200)

            expect(response.body).to.have.property('username').that.is.an('string')
            expect(response.body).to.have.property('userId').that.is.an('string')
            expect(response.body).to.have.property('email').that.is.an('string')
            expect(response.body.username).to.equal(emma.username)
            expect(response.body.userId).to.equal(emma._id.toString())
            expect(response.body.email).to.equal(emma.email)
        })
    })

    describe('PUT', function() {

    })
})
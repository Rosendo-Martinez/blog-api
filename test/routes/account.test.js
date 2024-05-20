const app = require('../appTest')
const request = require('supertest');
var assert = require('assert')
const { dbConnect, dbDisconnect } = require('../mongoDBConfigTest')
const NUMERIC_CONSTANTS = require('../../constants/numericConstants')
const ERROR_MESSAGES = require('../../constants/errorMessages')
const { createUser } = require('../../services/userServices')
const { generateUserToken } = require('../../utils/jwtUtils')
const User = require('../../models/User');
const { VALID_USERS } = require('../constants/testConstants')

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
    beforeEach(async () => {
        await dbConnect()
    })

    afterEach(async () => {
        await dbDisconnect()
    })

    describe('GET', function() {

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
        it('should deny unauthenticated users', async () => {
            await request(app)
                .put('/account')
                .set('Authorization', '')
                .send({})
                .expect(401)
        })

        it('should allow authenticated user with valid inputs to update account', async () => {
            const body = { newUsername: 'emma17', newEmail: 'emma17@hot.com', newPassword: 'EMMA17', currentPassword: VALID_USERS.EMMA.password }
            let emma = await createUser(VALID_USERS.EMMA.username, VALID_USERS.EMMA.email, VALID_USERS.EMMA.password)
            const token = generateUserToken(emma._id)

            const response = await request(app)
                .put('/account')
                .set('Authorization', `Bearer ${token}`)
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200)

            // check response outputs
            expect(response.body).to.have.property('fieldsUpdated').that.is.an('array')
            expect(response.body.fieldsUpdated).to.have.members(['username', 'email', 'password'])
            
            // check side effects
            emma = await User.findById(emma._id).exec() // get updated user document
            const passwordUpdated = await emma.verifyPassword(body.newPassword)
            expect(emma.username).to.equal(body.newUsername)
            expect(emma.email).to.equal(body.newEmail)
            expect(passwordUpdated).to.be.true
        })

        it('should deny authenticated users with valid inputs but incorrect password', async () => {
            // set up user
            const body = { newUsername: 'emma17', newEmail: 'emma17@hot.com', newPassword: 'EMMA17', currentPassword: VALID_USERS.EMMA.password + '1234' }
            const emma = await createUser(VALID_USERS.EMMA.username, VALID_USERS.EMMA.email, VALID_USERS.EMMA.password)
            const token = generateUserToken(emma._id)
            
            // make request w/ incorrect password
            const response = await request(app)
                .put('/account')
                .set('Authorization', `Bearer ${token}`)
                .send(body)
                .expect('Content-Type', /json/)
                .expect(400)

            // check response
            expect(response.body).to.not.have.property('fieldsUpdated')
            expect(response.body).to.have.property('currentPassword')
            expect(response.body.currentPassword.msg).to.equal(ERROR_MESSAGES.INCORRECT_PASSWORD)

            // check no side effects occurred
            const emmaUpToDate = await User.findById(emma._id).exec() // get updated user document
            const passwordNotUpdated = await emmaUpToDate.verifyPassword(VALID_USERS.EMMA.password)
            expect(emmaUpToDate.username).to.equal(VALID_USERS.EMMA.username)
            expect(emmaUpToDate.email).to.equal(VALID_USERS.EMMA.email)
            expect(passwordNotUpdated).to.be.true
        })
    })
})

describe('/login', function() {
    beforeEach(async () => {
        await dbConnect()
    })

    afterEach(async () => {
        await dbDisconnect()
    })

    it('should reject invalid inputs', async () => {
        const response = await request(app)
            .post('/login')
            .expect('Content-Type', /json/)
            .expect(400)

        expect(response.body).to.have.property('password')
        expect(response.body).to.have.property('username')
        expect(response.body.password.msg).to.equal(ERROR_MESSAGES.PASSWORD_MISSING)
        expect(response.body.username.msg).to.equal(ERROR_MESSAGES.USERNAME_MISSING)
    })

    it('should reject incorrect password', async () => {
        const emma = await createUser(VALID_USERS.EMMA.username, VALID_USERS.EMMA.email, VALID_USERS.EMMA.password)

        const response = await request(app)
            .post('/login')
            .send({ username: emma.username, password: VALID_USERS.EMMA.password + 'abc' })
            .expect('Content-Type', /json/)
            .expect(401)

        expect(response.body).to.have.property('msg')
        expect(response.body.msg).to.equal(ERROR_MESSAGES.INCORRECT_USERNAME_AND_OR_PASSWORD)
    })

    it('should authenticate users with correct credential inputs', async () => {
        const emma = await createUser(VALID_USERS.EMMA.username, VALID_USERS.EMMA.email, VALID_USERS.EMMA.password)

        const response = await request(app)
            .post('/login')
            .send({ username: emma.username, password: VALID_USERS.EMMA.password })
            .expect('Content-Type', /json/)
            .expect(200)

        expect(response.body).to.have.property('token')
        
        await request(app)
                .get('/account')
                .set('Authorization', `Bearer ${response.body.token}`)
                .expect('Content-Type', /json/)
                .expect(200)
    })
})
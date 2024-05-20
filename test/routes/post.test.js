const app = require('../appTest')
const request = require('supertest')
const { dbConnect, dbDisconnect } = require('../mongoDBConfigTest')
const NUMERIC_CONSTANTS = require('../../constants/numericConstants')
const ERROR_MESSAGES = require('../../constants/errorMessages')


// Chai is a ESM, so can't use 'require()'
before(async () => {
    const { expect } = await import('chai')
    global.expect = expect
})

describe('/posts', function() {
    it('it should require users to be authenticated', async () => {
        const response = await request(app)
            .post('/posts')
            .set('Authorization', '')
            .send({})
            .expect('Content-Type', /json/)
            .expect(401)

        expect(response.body).to.have.property('msg', ERROR_MESSAGES.AUTHENTICATION_FAILURE)
    })

    it('it should allow Authors with valid inputs to create post', async () => {
        
    })

    it('it should NOT allow authors with invalid inputs to create post', async () => {

    })


    it('it should require authenticated users to be authors', async () => {

    })
})
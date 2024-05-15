require('dotenv').config({ path: './test/.env.test' })
const jwt = require('jsonwebtoken')
const { generateUserToken } = require('../../utils/jwtUtils')

// Chai is a ESM, so can't use 'require()'
before(async () => {
    const { expect } = await import('chai')
    global.expect = expect
})

describe('generateUserToken', () => {
    it('should generate a valid JWT token', () => {
        const userId = '1234567890'
        const token = generateUserToken(userId)

        // Verify the token is valid
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        expect(decodedToken.userId).to.equal(userId)
    })

    it('should generate a token with specified expiry time', () => {
        const userId = '1234567890'
        const expiresIn = '1h' // Set expiry time to 1 hour
        const token = generateUserToken(userId, expiresIn)

        // Verify the token is valid and has the correct expiry time
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        expect(decodedToken.exp).to.be.a('number')
        expect(decodedToken.exp).to.be.closeTo(Math.floor(Date.now() / 1000) + 3600, 5) // Allow a 5-second difference
    })
})

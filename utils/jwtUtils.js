const jwt = require('jsonwebtoken')

/**
 * Generates a JWT token for a user.
 * 
 * This function takes a user's ID and uses it to generate a JSON Web Token (JWT).
 * The generated token can be used for secure communication between the client and the server
 * by ensuring that each request from the client is authenticated.
 * 
 * @param {string} userId - The user's unique identifier.
 * @returns {string} A JWT token that can be used to authenticate user requests.
 */
function generateUserToken(userId) {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '5m' })
}

module.exports.generateUserToken = generateUserToken
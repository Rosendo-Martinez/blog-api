const User = require('../models/User')
const Author = require('../models/Author')

/**
 * Creates a new user with a hashed password.
 * 
 * This function takes in a username, email, and password, creates a new user instance, 
 * hashes the password, sets it to the user instance, saves the user to the database, 
 * and then returns the user object.
 * 
 * @param {string} username - The username for the new user.
 * @param {string} email - The email address for the new user.
 * @param {string} password - The password for the new user which will be hashed before storage.
 * @returns {Promise<Object>} A promise that resolves to the new user object.
 * @throws {Error} If there is an error during user creation or hashing the password.
 */
async function createUser(username, email, password) {
    const user = new User({ username, email })
    await user.setPassword(password)
    await user.save()
    return user
}

/**
 * Retrieves detailed account information for a given user.
 * @param {Object} user The user object obtained from the authentication strategy.
 * @returns {Promise<Object>} A promise that resolves to an object containing user details.
 */
async function getAccountDetails(user) {
    try {
        const author = await Author.findOne({ user: user._id }).exec()
        return {
            email: user.email,
            username: user.username,
            userId: user._id.toString(),
            isAuthor: !!author,
            authorId: author ? author._id.toString() : undefined
        }
    } catch (error) {
        console.error('Error fetching author details:', error)
        throw error // Rethrow to handle it in the calling scope.
    }
}

module.exports.createUser = createUser
module.exports.getAccountDetails = getAccountDetails
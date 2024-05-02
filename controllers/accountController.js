const jwt = require('jsonwebtoken')
const passport = require('../passportjs')
const User = require('../models/User')
const Author = require('../models/Author')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')

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

module.exports.register = [
    body('username')
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Username must be minimum of 1 and a maximum of 30 characters.')
        .custom(async username => {
            const usernameCaseInsensitiveRegex = new RegExp(username, 'i')
            const user = await User.findOne({ username: { $regex : usernameCaseInsensitiveRegex } }).exec()

            if (user) {
                throw new Error()
            }
        })
        .withMessage('Another user already has this username.'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email must be valid.')
        .custom(async email => {
            const user = await User.findOne({ email: email }).exec()

            if (user) {
                throw new Error()
            }
        })
        .withMessage('Another user already has this email.'),
    body('password')
        .isLength({ min: 4, max: 25 })
        .withMessage('Password must be between 4 and 25 characters long.'),
    async (req, res) => {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json(result.mapped())
        }

        try {
            const user = await createUser(req.body.username, req.body.email, req.body.password)
            res.json({ token: generateUserToken(user._id) })
        } catch (error) {
            res.status(500).json({ message: 'Error creating user', error: error.message })
        }
    }
]

module.exports.updateAccount = [
    passport.authenticate('jwt', { session: false }),
    body('newUsername')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Username must be minimum of 1 and a maximum of 30 characters.')
        .custom(async (username, { req }) => {
            const usernameCaseInsensitiveRegex = new RegExp(`^${username}$`, 'i')
            const user = await User.findOne({ username: { $regex : usernameCaseInsensitiveRegex }, _id: { $ne: req.user._id } }).exec()

            if (user) {
                throw new Error()
            }
        })
        .withMessage('Another user already has this username.'),
    body('newEmail')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Email must be valid.')
        .custom(async (email, { req }) => {
            const user = await User.findOne({ email: email, _id: { $not: req.user._id } }).exec()

            if (user) {
                throw new Error()
            }
        })
        .withMessage('Another user already has this email.'),
    body('newPassword')
        .optional()
        .isLength({ min: 4, max: 25 })
        .withMessage('Password must be between 4 and 25 characters long.'),
    body('currentPassword')
        .custom(async (password, { req }) => {
            const passwordMatches = await bcrypt.compare(password, req.user.hashedPassword)

            if (!passwordMatches) {
                throw new Error()
            }
        })
        .withMessage('Password is incorrect.'),
    async (req, res) => {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json(result.mapped())
        }

        try {
            const updates = {}
            if (req.body.newUsername) {
                updates.username = req.body.newUsername
            }
            if (req.body.newEmail) {
                updates.email = req.body.newEmail
            }
            if (req.body.newPassword) {
                updates.password = req.body.newPassword
            }
            
            await req.user.update(updates)
            await req.user.save();
            res.json({ msg: 'Account updated.', fieldsUpdated: updatedFields });
        } catch (error) {
            res.status(500).json({ msg: 'Failed to update account.', error: error.message, fieldsAttempted: updatedFields });
        }
    }
]

module.exports.getAccount = [
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const accountDetails = await getAccountDetails(req.user)
            res.json(accountDetails)
        } catch (error) {
            res.status(500).json({ msg: 'Failed to get account.', error: error.message })
        }
    }
]

module.exports.login = [
    (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(500).json({ msg: 'Authentication failed due to server error.', error: err.toString() })
            }
            if (!user) {
                return res.status(401).json({ msg: 'Authentication failed.', reason: info.message })
            }
            req.user = user
            next()
        })(req, res, next)
    },
    (req, res) => {
        const token = generateUserToken(req.user._id)
        res.json({
            msg: "Here is your authentication token. Make sure to send it with your request every time you need to access a protected API endpoint.",
            token: token
        })
    }
]
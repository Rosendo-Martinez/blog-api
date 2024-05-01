const jwt = require('jsonwebtoken')
const passport = require('../passportjs')
const User = require('../models/User')
const Author = require('../models/Author')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')

function generateUserToken(userId) {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '5m' })
}

/**
 * @param {String} password 
 * @returns {Promise}
 */
function hashPassword(password) {
    const SALT_ROUNDS = 2
    return bcrypt.hash(password, SALT_ROUNDS)
}

async function createUser(username, email, password) {
    const hashedPassword = await hashPassword(password)

    return new User({ username: username, email: email, hashedPassword: hashedPassword })
}

/**
 * Updates the user object (does not save).
 * 
 * @param {*} user User object to update.
 * @param {*} updates Object containing the fields to update; undefined values will be ignored.
 * @returns {Promise<String[]>} Promise returns an array of strings listing the updated fields.
 */
async function updateUser(user, updates) {
    const updatedFields = [];

    for (const field in updates) {
        if (updates[field] === undefined) {
            continue; // Skip undefined values to prevent unwanted updates.
        }

        if (field === 'password') {
            user.hashedPassword = await hashPassword(updates[field]); // Ensure password is hashed.
            updatedFields.push('password');
        } else {
            user[field] = updates[field];
            updatedFields.push(field);
        }
    }

    return updatedFields;
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
            await user.save()
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
            const updatedFields = await updateUser(req.user, { username: req.body.newUsername, email: req.body.newEmail, password: req.body.newPassword })
    
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
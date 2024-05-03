const passport = require('../config/passportConfig')
const User = require('../models/User')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const { generateUserToken } = require('../utils/jwtUtils')
const { createUser, getAccountDetails } = require('../services/userServices')

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
            
            const updatedFields = await req.user.update(updates)
            await req.user.save();
            res.json({ msg: 'Account updated.', fieldsUpdated: updatedFields });
        } catch (error) {
            res.status(500).json({ msg: 'Failed to update account.', error: error.message });
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
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    (req, res, next) => {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json(result.mapped())
        }
        next()
    },
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
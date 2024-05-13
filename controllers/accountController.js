const passport = require('../config/passportConfig')
const User = require('../models/User')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const { generateUserToken } = require('../utils/jwtUtils')
const { createUser, getAccountDetails } = require('../services/userServices')
const ERROR_MESSAGES = require('../constants/errorMessages')

module.exports.register = [
    body('username')
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage(ERROR_MESSAGES.USERNAME_LENGTH)
        .custom(async username => {
            const usernameCaseInsensitiveRegex = new RegExp(username, 'i')
            const user = await User.findOne({ username: { $regex : usernameCaseInsensitiveRegex } }).exec()

            if (user) {
                throw new Error()
            }
        })
        .withMessage(ERROR_MESSAGES.USERNAME_ALREADY_IN_USE),
    body('email')
        .trim()
        .isEmail()
        .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
        .custom(async email => {
            const user = await User.findOne({ email: email }).exec()

            if (user) {
                throw new Error()
            }
        })
        .withMessage(ERROR_MESSAGES.EMAIL_ALREADY_IN_USE),
    body('password')
        .isLength({ min: 4, max: 25 })
        .withMessage(ERROR_MESSAGES.PASSWORD_LENGTH),
    async (req, res) => {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json(result.mapped())
        }

        try {
            const user = await createUser(req.body.username, req.body.email, req.body.password)
            res.json({ token: generateUserToken(user._id) })
        } catch (error) {
            res.status(500).json({ message: ERROR_MESSAGES.CREATE_ACCOUNT_FAILED, error: error.message })
        }
    }
]

module.exports.updateAccount = [
    passport.authenticate('jwt', { session: false }),
    body('newUsername')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage(ERROR_MESSAGES.USERNAME_LENGTH)
        .custom(async (username, { req }) => {
            const usernameCaseInsensitiveRegex = new RegExp(`^${username}$`, 'i')
            const user = await User.findOne({ username: { $regex : usernameCaseInsensitiveRegex }, _id: { $ne: req.user._id } }).exec()

            if (user) {
                throw new Error()
            }
        })
        .withMessage(ERROR_MESSAGES.USERNAME_ALREADY_IN_USE),
    body('newEmail')
        .optional()
        .trim()
        .isEmail()
        .withMessage(ERROR_MESSAGES.INVALID_EMAIL)
        .custom(async (email) => {
            const user = await User.findOne({ email: email }).exec()

            if (user) {
                throw new Error()
            }
        })
        .withMessage(ERROR_MESSAGES.EMAIL_ALREADY_IN_USE),
    body('newPassword')
        .optional()
        .isLength({ min: 4, max: 25 })
        .withMessage(ERROR_MESSAGES.PASSWORD_LENGTH),
    body('currentPassword')
        .custom(async (password, { req }) => {
            const passwordMatches = await bcrypt.compare(password, req.user.hashedPassword)

            if (!passwordMatches) {
                throw new Error()
            }
        })
        .withMessage(ERROR_MESSAGES.INCORRECT_PASSWORD),
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
            res.status(500).json({ msg: ERROR_MESSAGES.ACCOUNT_UPDATE_FAILED, error: error.message });
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
            res.status(500).json({ msg: ERROR_MESSAGES.GET_ACCOUNT_FAILED, error: error.message })
        }
    }
]

module.exports.login = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage(ERROR_MESSAGES.USERNAME_MISSING),
    body('password')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.PASSWORD_MISSING),
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
                return res.status(500).json({ msg: ERROR_MESSAGES.AUTHENTICATION_FAILURE, error: err.toString() })
            }
            if (!user) {
                return res.status(401).json({ msg: ERROR_MESSAGES.AUTHENTICATION_FAILURE, reason: info.message })
            }
            req.user = user
            next()
        })(req, res, next)
    },
    (req, res) => {
        const token = generateUserToken(req.user._id)
        res.json({
            token: token
        })
    }
]
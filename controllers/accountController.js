const jwt = require('jsonwebtoken')
const passport = require('../passportjs')
const User = require('../models/User')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')

function generateUserToken(userId) {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '5m' })
}

async function createUser(username, email, password) {
    const SALT_ROUNDS = 2
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    return new User({ username: username, email: email, hashedPassword: hashedPassword })
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

module.exports.updateAccount = function(req, res) {
    res.json({ msg: 'Update account not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.getAccount = [
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
        res.json({ msg: 'Get account not implemented', params: req.params, user: req.user, body: req.body })
    }
]

module.exports.login = function(req, res) {
    const user = User.find(req.body.username, req.body.password)

    if (user) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '5m' })
        res.json({ 
            msg: "Here is your authentication token. Make sure to send it with your request every time you need to access a protected API endpoint.", 
            token: token
        })
    } else {
        res.status(401).json({ msg: 'Wrong username and/or password.' })
    }
}
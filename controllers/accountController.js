const jwt = require('jsonwebtoken')
const passport = require('../passportjs')
const User = require('../fakeDB')

module.exports.register = function(req, res) {
    res.json({ msg: 'Register not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.updateAccount = function(req, res) {
    res.json({ msg: 'Update account not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.getAccount = function(req, res) {
    res.json({ msg: 'Get account not implemented', params: req.params, user: req.user, body: req.body })
}

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
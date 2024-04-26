const jwt = require('jsonwebtoken')

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
    // This code is temporary till DB is constructed.
    // Once DB is set up, this should all be changed to use the 
    // DB instead of using a hardcoded user.
    const USER = { username: 'genos', password: 'disciple', id: '1' } // temporary till DB is constructed
    const SECRET = '12345' // temporary till env var is set up

    if (req.body.username === USER.username && req.body.password === USER.password) {
        const token = jwt.sign({ id: USER.id }, SECRET, { expiresIn: '5m' })
        res.json({ 
            msg: "Here is your authentication token. Make sure to send it with your request every time you need to access a protected API endpoint.", 
            token: token
        })
    } else {
        res.status(401).json({ msg: 'Wrong username and/or password.' })
    }
}
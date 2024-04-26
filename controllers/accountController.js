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
    res.json({ msg: 'Login to account not implemented', params: req.params, user: req.user, body: req.body })
}
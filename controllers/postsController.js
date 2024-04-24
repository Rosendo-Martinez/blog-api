module.exports.getPosts = function(req, res) {
    res.json(`GET /posts not implemented`)
}

module.exports.createPost = function(req, res) {
    res.json({ msg: 'POST /posts not implemented', body: req.body, user: req.user })
}

module.exports.getPostById = function(req, res) {
    res.json({ msg: 'GET /posts/:id not implemeted', params: req.params, user: req.user })
}

module.exports.deletePostById = function(req, res) {
    res.json({ msg: 'DELETE /posts/:id not implemented', params: req.params, user: req.user })
}

module.exports.updatePostById = function(req, res) {
    res.json({ msg: 'PUT /posts/:id not implemented', params: req.params, user: req.user, body: req.body })
}
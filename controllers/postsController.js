module.exports.getPosts = function(req, res) {
    res.json(`Get post list not implemented`)
}

module.exports.createPost = function(req, res) {
    res.json({ msg: 'Create post not implemented', body: req.body, user: req.user })
}

module.exports.getPostById = function(req, res) {
    res.json({ msg: 'Get post by id not implemeted', params: req.params, user: req.user })
}

module.exports.deletePostById = function(req, res) {
    res.json({ msg: 'Delete post by id not implemented', params: req.params, user: req.user })
}

module.exports.updatePostById = function(req, res) {
    res.json({ msg: 'Update post by id not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.likePostById = function(req, res) {
    res.json({ msg: 'Like post not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.getLikes = function(req, res) {
    res.json({ msg: 'Get likes on post not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.deleteLikeById = function(req, res) {
    res.json({ msg: 'Delete like on post not implemented', params: req.params, user: req.user, body: req.body })
}
module.exports.getCommentReplies = function(req, res) {
    res.json({ msg: 'Get comment replies not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.getComment = function(req, res) {
    res.json({ msg: 'Get comment not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.getCommentLikes = function(req, res) {
    res.json({ msg: 'Get comment likes not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.createReply = function(req, res) {
    res.json({ msg: 'Reply to comment not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.deleteReply = function(req, res) {
    res.json({ msg: 'Delete reply to comment not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.updateReply = function(req, res) {
    res.json({ msg: 'Update reply to comment not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.deleteCommentLike = function(req, res) {
    res.json({ msg: 'Delete like on comment not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.likeComment = function(req, res) {
    res.json({ msg: 'Like a comment not implemented', params: req.params, user: req.user, body: req.body })
}
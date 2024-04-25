module.exports.likeReply = function(req, res) {
    res.json({ msg: 'Like reply not implemented', params: req.params, user: req.user, body: req.body })
}

module.exports.deleteReplyLike = function(req, res) {
    res.json({ msg: 'Delete reply like not implemented', params: req.params, user: req.user, body: req.body })
}
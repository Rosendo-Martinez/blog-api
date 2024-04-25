const express = require('express')
const router = express.Router()
const controller = require('../controllers/commentsController')

router.get('/comments/:commentId/replies', controller.getCommentReplies)

router.get('/comments/:commentId', controller.getComment)

router.get('/comments/:commentId/likes', controller.getCommentLikes)

router.post('/comments/:commentId/replies', controller.createReply)

router.delete('/comments/:commentId/replies/:replyId', controller.deleteReply)

router.put('/comments/:commentId/replies/:replyId', controller.updateReply)

router.delete('/comments/:commentId/likes/:likeId', controller.deleteCommentLike)

router.post('/comments/:commentId/likes', controller.likeComment)

module.exports = router
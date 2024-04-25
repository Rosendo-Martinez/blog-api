const express = require('express')
const router = express.Router()
const controller = require('../controllers/repliesController')

router.post('/replies/:replyId/likes', controller.likeReply)

router.delete('/replies/:replyId/likes/:likeId', controller.deleteReplyLike)

module.exports = router

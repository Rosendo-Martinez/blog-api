const express = require('express')
const router = express.Router()
const controller = require('../controllers/postsController')

router.get('/posts', controller.getPosts)

router.post('/posts', controller.createPost)

router.get('/posts/:postId', controller.getPostById)

router.delete('/posts/:postId', controller.deletePostById)

router.put('/posts/:postId', controller.updatePostById)

router.post('/posts/:postId/likes', controller.likePostById)

router.get('/posts/:postId/likes', controller.getLikes)

router.delete('/posts/:postId/likes/:likeId', controller.deleteLikeById)

module.exports = router
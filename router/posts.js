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

router.get('/posts/:postId/comments', controller.getPostComments)

router.post('/posts/:postId/comments', controller.createPostComment)

router.put('/posts/:postId/comments/:commentId', controller.updatePostComment)

router.delete('/posts/:postId/comments/:commentId', controller.deletePostComment)

module.exports = router

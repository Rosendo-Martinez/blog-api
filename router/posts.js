const express = require('express')
const router = express.Router()
const controller = require('../controllers/postsController')

router.get('/posts', controller.getPosts)

router.post('/posts', controller.createPost)

router.get('/posts/:id', controller.getPostById)

router.delete('/posts/:id', controller.deletePostById)

router.put('/posts/:id', controller.updatePostById)

module.exports = router
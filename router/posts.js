const express = require('express')
const router = express.Router()

router.get('/posts', (req, res) => {
    res.json(`GET /posts not implemented`)
})

router.post('/posts', (req, res) => {
    res.json({ msg: 'POST /posts not implemented', body: req.body, user: req.user })
})

router.get('/posts/:id', (req, res) => {
    res.json({ msg: 'GET /posts/:id not implemeted', params: req.params, user: req.user })
})

router.delete('/posts/:id', (req, res) => {
    res.json({ msg: 'DELETE /posts/:id not implemented', params: req.params, user: req.user })
})

router.put('/posts/:id', (req, res) => {
    res.json({ msg: 'PUT /posts/:id not implemented', params: req.params, user: req.user, body: req.body })
})

module.exports = router
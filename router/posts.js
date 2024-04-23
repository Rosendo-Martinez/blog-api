const express = require('express')
const router = express.Router()

router.get('/posts', (req, res) => {
    res.json({ msg: 'get posts'});
})

module.exports = router
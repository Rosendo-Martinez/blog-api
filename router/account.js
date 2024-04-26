const express = require('express')
const router = express.Router()
const controller = require('../controllers/accountController')

router.post('/register', controller.register)

router.put('/account', controller.updateAccount)

router.get('/account', controller.getAccount)

router.post('/login', controller.login)

module.exports = router

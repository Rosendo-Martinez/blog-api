const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config({ path: './test/.env.test' })

const app = express()

const replies = require('../router/replies')
const account = require('../router/account')


app.use(bodyParser.json())
app.use('/', replies)
app.use('/', account)

module.exports = app
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

const replies = require('../router/replies')


app.use(bodyParser.json())
app.use('/', replies)

module.exports = app
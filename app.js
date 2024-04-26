const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const PORT = 3000

const posts = require('./router/posts')
const comments = require('./router/comments')
const replies = require('./router/replies')
const account = require('./router/account')

app.use(bodyParser.json())
app.use('/', posts)
app.use('/', comments)
app.use('/', replies)
app.use('/', account)

app.listen(PORT)

const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const PORT = 3000

const posts = require('./router/posts')

app.use(bodyParser.json())
app.use('/', posts)

app.listen(PORT)

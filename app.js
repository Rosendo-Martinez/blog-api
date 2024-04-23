const express = require('express')
const app = express()
const PORT = 3000

const posts = require('./router/posts');

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.use('/', posts)

app.listen(PORT)
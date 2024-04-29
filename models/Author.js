const mongoose = require('mongoose')

const AuthorSchema = new mongoose.Schema({
    user: { type: mongoose.ObjectId, ref: 'User', required: true }
})

module.exports = mongoose.model('Author', AuthorSchema)
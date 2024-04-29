const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    author: { type: mongoose.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, minLength: 1, trim: true },
    date: { type: Date, default: new Date() },
    post: { type: mongoose.ObjectId, ref: 'Post', required: true }
})

module.exports = mongoose.model('Comment', CommentSchema)
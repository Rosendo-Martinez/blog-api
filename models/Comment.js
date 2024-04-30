const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    author: { type: mongoose.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, minLength: 1, trim: true },
    postedDate: { type: Date, default: new Date() },
    commentOn: { type: mongoose.ObjectId, required: true, enum: ['Post', 'Comment'] },
    commentOnType: { type: String, required: true, enum: ['Post', 'Comment'] }
})

module.exports = mongoose.model('Comment', CommentSchema)
const mongoose = require('mongoose')

const ReplySchema = new mongoose.Schema({
    author: { type: mongoose.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, minLength: 1, trim: true },
    date: { type: Date, default: new Date() },
    replyTo: { type: mongoose.ObjectId, required: true },
    replyToType: { type: String, enum: ['Reply', 'Comment'], required: true }
})

module.exports = mongoose.model('Reply', ReplySchema)
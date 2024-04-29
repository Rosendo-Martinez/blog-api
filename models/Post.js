const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true, minLength: 1, maxLength: 100, trim: true },
    body: { type: String, required: true, minLength: 1, trim: true },
    date_published: { type: Date },
    isPublished: { type: Boolean, required: true },
    author: { type: mongoose.ObjectId, ref: 'Author', required: true }
})

module.exports = mongoose.model('Post', PostSchema)
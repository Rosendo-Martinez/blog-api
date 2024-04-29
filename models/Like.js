const mongoose = require('mongoose')

const LikeSchema = new mongoose.Schema({
  user: { type: mongoose.ObjectId, ref: 'User', required: true },
  entity: { type: mongoose.ObjectId, required: true },
  entityType: { type: String, enum: ['Post', 'Comment', 'Reply'], required: true }
})

module.exports = mongoose.model('Like', LikeSchema)
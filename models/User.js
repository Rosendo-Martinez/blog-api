const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, index: true, unique: true, minLength: 1, maxLength: 30, trim: true },
    email: { type: String, required: true, index: true, unique: true, minLength: 1, trim: true },
    hashedPassword: { type: String, required: true, minLength: 1 }
});

module.exports = mongoose.model('User', UserSchema);
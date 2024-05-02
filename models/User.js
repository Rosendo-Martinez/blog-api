const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, index: true, unique: true, minLength: 1, maxLength: 30, trim: true },
    email: { type: String, required: true, index: true, unique: true, minLength: 1, trim: true },
    hashedPassword: { type: String, required: true, minLength: 1, select: false }
});

/**
 * Verifies the user's password by comparing it with the hashed password stored in the database.
 *
 * @param {string} password The plaintext password to verify.
 * @returns {Promise<boolean>} A promise that resolves with `true` if the password matches the hashed password, otherwise `false`.
 */
UserSchema.methods.verifyPassword = async function(password) {
    return bcrypt.compare(password, this.hashedPassword);
}

/**
 * Sets the user's password after hashing it.
 * This method automates the hashing process and directly sets the hashed password on the user instance.
 * 
 * @param {String} password - The plain text password to hash and set.
 * @returns {Promise<void>} A promise that resolves when the password has been hashed and set.
 */
UserSchema.methods.setPassword = async function(password) {
    const SALT_ROUNDS = 2
    this.hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
}

module.exports = mongoose.model('User', UserSchema)
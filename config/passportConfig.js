const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const passport = require('passport')
const User = require('../models/User')
const LocalStrategy = require('passport-local')

passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    },
    function verify(jwt_payload, done) {
        User.findById(jwt_payload.userId).exec()
            .then(user => {
                if (!user) {
                    return done(null, false)
                }

                done(null, user)
            })
            .catch(err => done(err))
    }
))

passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        session: false
    },
    async function verify(username, password, done) {
        try {
            const user = await User.findOne({ username }).exec()

            if (!user) {
                return done(null, false, { message: 'Incorrect username.' })
            }

            const passwordMatch = await user.verifyPassword(password)
            if (!passwordMatch) {
                return done(null, false, { message: 'Incorrect password.' })
            }

            done(null, user)
        } catch (error) {
            done(error)
        }
    }
))

module.exports = passport;
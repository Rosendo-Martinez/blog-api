const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const passport = require('passport')
const User = require('./fakeDB')

passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    },
    function verify(jwt_payload, done) {
        const user = User.findById(jwt_payload.userId)

        if (user) {
            return done(null, user)
        } else {
            return done(null, false)
        }
    }
))

module.exports = passport;
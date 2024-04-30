const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const passport = require('passport')
const User = require('./models/User')

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

module.exports = passport;
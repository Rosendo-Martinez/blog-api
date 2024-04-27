const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const passport = require('passport')

const SECRET = '12345' // temporary till env var is set up
const USERS = [{ username: 'genos', password: 'disciple', id: '1' }] // temporary till DB is constructed

passport.use(new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: SECRET
    }, 
    function verify(jwt_payload, done) {
        const user = USERS.find((u) => u.id === jwt_payload.id)
        return done(null, user)
    }
))

module.exports = passport;
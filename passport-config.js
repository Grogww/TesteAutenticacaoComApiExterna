const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;

        if (allowedDomain && (!email || !email.endsWith('@' + allowedDomain))) {
            return done(null, false, { message: 'Dominio de email nao autorizado' });
        }

        const user = {
            id: profile.id,
            name: profile.displayName,
            email: email,
            photo: profile.photos && profile.photos[0] && profile.photos[0].value
        };

        return done(null, user);
    }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;

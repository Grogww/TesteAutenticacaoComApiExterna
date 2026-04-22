require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const passport = require('./passport-config');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.redirect('/');
}

app.get('/', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/profile');
    const error = req.query.error;
    res.render('index', { error: error });
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/?error=unauthorized' }),
    (req, res) => res.redirect('/profile')
);

app.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user });
});

app.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.session.destroy(() => res.redirect('/'));
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const express = require('express');
const session = require('express-session');
const passport = require('./passport');
const issuer = require('./issuer');
const client = require('./client');
const ejs = require('ejs');

const app = express();

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use(session({
    secret: 'demo',
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.redirect('/login')
});

app.get('/login', passport.authenticate('open-id'), (req, res) => {
    res.redirect('/loginSuccess');
});

app.get('/loginSuccess', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.render('index', {id_token: req.user.tokenset.id_token, email: req.user.email, id: req.user.sub })
});

app.get('/logout', (req, res) => {
    if (!req.user) {
        res.redirect('/login');
    }
    const accessToken = req.user.tokenset.access_token;
    const refreshToken = req.user.tokenset.refresh_token;
    const idToken = req.user.tokenset.id_token;
    const endSessionEndpoint = issuer.end_session_endpoint;
    const redirectUri = client.post_logout_redirect_uris[0];
    req.logout(); // terminate session
    // invalidate tokens
    client.revoke(accessToken, 'access_token');
    client.revoke(refreshToken, 'refresh_token');
    // nodify OP logout
    res.redirect(
        `${endSessionEndpoint}?id_token_hint=${idToken}&post_logout_redirect_uri=${redirectUri}`
    );
});

module.exports = app;

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require("express-session");

const passport = require('passport');
const FamilySearchStrategy = require('passport-familysearch').Strategy;

/*
  Provide your FamilySearch developer key here. You can register for one at https://www.familysearch.org/developers/
 */
const FAMILYSEARCH_DEVELOPER_KEY = "insert_familysearch_developer_key_here";

/*
  Uncomment the environment that you want to run against. Your developer key must be registered with this environment.
 */
// const FAMILYSEARCH_IDENT_BASE = 'https://ident.familysearch.org';
// const FAMILYSEARCH_IDENT_BASE = 'https://identbeta.familysearch.org';
const FAMILYSEARCH_IDENT_BASE = 'https://integration.familysearch.org';
// const FAMILYSEARCH_API_BASE = 'https://api.familysearch.org';
// const FAMILYSEARCH_API_BASE = 'https://apibeta.familysearch.org';
const FAMILYSEARCH_API_BASE = 'https://api-integ.familysearch.org';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete FamilySearch profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FamilySearchStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and FamilySearch profile), and
//   invoke a callback with a user object.
passport.use(new FamilySearchStrategy({
    authorizationURL: `${FAMILYSEARCH_IDENT_BASE}/cis-web/oauth2/v3/authorization`,
    tokenURL: `${FAMILYSEARCH_IDENT_BASE}/cis-web/oauth2/v3/token`,
    devKey: FAMILYSEARCH_DEVELOPER_KEY,
    callbackURL: "http://localhost:3000/auth/familysearch/callback",
    userProfileURL: `${FAMILYSEARCH_API_BASE}/platform/users/current`
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's FamilySearch profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the FamilySearch account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/familysearch
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in FamilySearch authentication will involve redirecting
//   the user to familysearch.org.  After authorization, FamilySearch will redirect the user
//   back to this application at /auth/familysearch/callback
app.get('/auth/familysearch',
  passport.authenticate('familysearch'),
  function(req, res){
    // The request will be redirected to FamilySearch for authentication, so this
    // function will not be called.
  });

// GET /auth/familysearch/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/familysearch/callback',
  passport.authenticate('familysearch', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000, function () {
  console.log('Listening on port 3000');
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

module.exports = app;

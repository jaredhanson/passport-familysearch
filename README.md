# Passport-FamilySearch

[Passport](http://passportjs.org/) strategy for authenticating with [FamilySearch](http://familysearch.org)
using the OAuth 2.0 or OpenID Connect API. The legacy strategy using the OAuth 1.0a API is
available for use, to support older applications.

This module lets you authenticate using FamilySearch in your Node.js
applications.  By plugging into Passport, FamilySearch authentication can be
easily and unobtrusively integrated into any application or framework that
supports [Connect](http://www.senchalabs.org/connect/)-style middleware,
including [Express](http://expressjs.com/).

## Install

    $ npm install passport-familysearch

## Usage

#### Configure OpenID Connect Strategy

Familysearch OpenID Connect Strategy requires a FamilySearch `clientID` and a `callbackURL`. The rest are optional parameters.

```javascript
var FamilySearchOpenIdConnectStrategy = require('passport-familysearch').OpenIDConnectStrategy;

passport.use(new FamilySearchOpenIdConnectStrategy({
  clientID: FAMILYSEARCH_DEVELOPER_KEY,
  callbackURL: "http://localhost:5000/auth/callback",

  // THE REST ARE OPTIONAL
  // scope: "profile",
  // authorizationURL: "https://ident.familysearch.org/cis-web/oauth2/v3/authorization",
  // tokenURL: "https://ident.familysearch.org/cis-web/oauth2/v3/token",
  // realm: REALM,
  // state: STATE,
  // skipUserProfile: true
},
function(iss, sub, profile, idToken, accessToken, refreshToken, params,  done) {
  var user = {};
  user.accessToken = params.access_token;
  user.accessTokenJWT = accessToken;
  user.idToken = params.id_token;
  user.parsedIdToken = idToken;

  return done(null, user);
});
```
#### Configure OAuth 2 Strategy

FamilySearch supports authentication using a FamilySearch account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which accepts these credentials and calls `done` providing a user, as well as `options` specifying a developer key and callback URL.
```javascript
var FamilySearchStrategy = require('passport-familysearch').Strategy;

passport.use(new FamilySearchStrategy({
    devKey: FAMILYSEARCH_DEVELOPER_KEY,
    callbackURL: "http://127.0.0.1:3000/auth/familysearch/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ familysearchId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```
#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'familysearch'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:
```javascript
app.get('/auth/familysearch',
  passport.authenticate('familysearch'));

app.get('/auth/familysearch/callback',
  passport.authenticate('familysearch', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

## OAuth 1 Usage

#### Configure Strategy

The FamilySearch authentication strategy authenticates users using a
FamilySearch account and OAuth tokens.  The strategy requires a `verify`
callback, which accepts these credentials and calls `done` providing a user, as
well as `options` specifying a consumer key, consumer secret, and callback URL.
```javascript
var FamilySearchStrategy = require('passport-familysearch').LegacyStrategy;

passport.use(new FamilySearchStrategy({
    consumerKey: FAMILYSEARCH_DEVELOPER_KEY,
    consumerSecret: '',
    callbackURL: "http://127.0.0.1:3000/auth/familysearch/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate({ familysearchId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```
## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-familysearch/tree/master/examples).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport-familysearch.png)](http://travis-ci.org/jaredhanson/passport-familysearch)

## Credits

  - [Jared Hanson](https://github.com/jaredhanson)
  - [Logan Allred](https://github.com/redbugz)
  - [Tim Shadel](https://github.com/timshadel)
  - [Tyler Graf](https://github.com/tylergraf)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>

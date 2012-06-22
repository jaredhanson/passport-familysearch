# Passport-FamilySearch

[Passport](http://passportjs.org/) strategy for authenticating with [FamilySearch](http://familysearch.org)
using the OAuth 1.0a API.

This module lets you authenticate using FamilySearch in your Node.js
applications.  By plugging into Passport, FamilySearch authentication can be
easily and unobtrusively integrated into any application or framework that
supports [Connect](http://www.senchalabs.org/connect/)-style middleware,
including [Express](http://expressjs.com/).

## Installation

    $ npm install passport-familysearch

## Usage

#### Configure Strategy

The FamilySearch authentication strategy authenticates users using a
FamilySearch account and OAuth tokens.  The strategy requires a `verify`
callback, which accepts these credentials and calls `done` providing a user, as
well as `options` specifying a consumer key, consumer secret, and callback URL.

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

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'familysearch'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/familysearch',
      passport.authenticate('familysearch'),
      function(req, res){
        // The request will be redirected to FamilySearch for authentication, so
        // this function will not be called.
      });
    
    app.get('/auth/familysearch/callback', 
      passport.authenticate('familysearch', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-familysearch/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport-familysearch.png)](http://travis-ci.org/jaredhanson/passport-familysearch)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

(The MIT License)

Copyright (c) 2011 Jared Hanson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

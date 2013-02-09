/**
 * Module dependencies.
 */
var util = require('util')
  , OAuthStrategy = require('passport-oauth').OAuthStrategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * Legacy `Strategy` constructor.
 *
 * The FamilySearch legacy authentication strategy authenticates requests by delegating
 * to FamilySearch using the OAuth 1.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts a `token`,
 * `tokenSecret` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `consumerKey`     FamilySearch Developer Key
 *   - `consumerSecret`  an empty string, as required by FamilySearch
 *   - `callbackURL`     URL to which FamilySearch will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new FamilySearchStrategy({
 *         consumerKey: '123-456-789',
 *         consumerSecret: ''
 *         callbackURL: 'https://www.example.net/auth/familysearch/callback'
 *       },
 *       function(token, tokenSecret, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.requestTokenURL = options.requestTokenURL || 'https://api.familysearch.org/identity/v2/request_token';
  options.accessTokenURL = options.accessTokenURL || 'https://api.familysearch.org/identity/v2/access_token';
  options.userAuthorizationURL = options.userAuthorizationURL || 'https://api.familysearch.org/identity/v2/authorize';
  options.signatureMethod = options.signatureMethod || 'PLAINTEXT';
  options.sessionKey = options.sessionKey || 'oauth:familysearch';

  OAuthStrategy.call(this, options, verify);
  this.name = 'familysearch';
  this._userProfileURL = options.userProfileURL || 'https://api.familysearch.org/identity/v2/user';
  
  // FamilySearch's OAuth implementation does not conform to the specification.
  // As a workaround, the underlying node-oauth functions are replaced in order
  // to deal with the idiosyncrasies.
  
  this._oauth._buildAuthorizationHeaders = function(orderedParameters) {
    var authHeader="OAuth ";
    if( this._isEcho ) {
      authHeader += 'realm="' + this._realm + '",';
    }

    for( var i= 0 ; i < orderedParameters.length; i++) {
       // Whilst the all the parameters should be included within the signature, only the oauth_ arguments
       // should appear within the authorization header.
       if( this._isParameterNameAnOAuthParameter(orderedParameters[i][0]) ) {
         if (orderedParameters[i][0] === 'oauth_signature') {
           // JDH: This is a workaround for FamilySearch's non-conformant OAuth
           //      implementation, which expects the `oauth_signature` value to
           //      be unencoded
           authHeader+= "" + this._encodeData(orderedParameters[i][0])+"=\""+ orderedParameters[i][1]+"\",";
         } else {
           authHeader+= "" + this._encodeData(orderedParameters[i][0])+"=\""+ this._encodeData(orderedParameters[i][1])+"\",";
         }
       }
    }

    authHeader= authHeader.substring(0, authHeader.length-1);
    return authHeader;
  }
  
  this._oauth._isParameterNameAnOAuthParameter= function(parameter) {
    // JDH: This is a workaround to force the `oauth_callback` parameter out of
    //      the Authorization header and into the request body, where
    //      FamilySearch expects to find it.
    if (parameter === 'oauth_callback') { return false; }
    var m = parameter.match('^oauth_');
    if( m && ( m[0] === "oauth_" ) ) {
      return true;
    }
    else {
      return false;
    }
  };
}

/**
 * Inherit from `OAuthStrategy`.
 */
util.inherits(Strategy, OAuthStrategy);

/**
 * Retrieve user profile from FamilySearch.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `id`
 *   - `displayName`
 *
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Object} params
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(token, tokenSecret, params, done) {
  this._oauth.get(this._userProfileURL + '?dataFormat=application/json&sessionId=' + token, token, tokenSecret, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {
      var jsonData = JSON.parse(body);
      var user = jsonData.users[0];

      var profile = { provider: 'familysearch' };
      profile.id = user.id;
      profile.username = user.username;
      for (var i = 0; i < user.names.length; i++) {
        var name = user.names[i];
        switch (name.type) {
          case 'Display':
            profile.displayName = name.value;
            break;
          case 'Family':
            profile.name = profile.name || {};
            profile.name.familyName = name.value;
            break;
          case 'Given':
            profile.name = profile.name || {};
            profile.name.givenName = name.value;
            break;
        }
      }
      for (var i = 0; i < user.emails.length; i++) {
        var email = user.emails[i];
        if (email.value) {
          profile.emails = profile.emails || [];
          var profileEmail = {
            value: email.value
          }
          if (email.type === 'Primary') {
            profileEmail.primary = true;
          }
          profile.emails.push(profileEmail);
        }
      }

      profile._raw = body;
      profile._json = jsonData;

      done(null, profile);
    } catch (e) {
      console.error("Failed to load user profile: ", e);
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;

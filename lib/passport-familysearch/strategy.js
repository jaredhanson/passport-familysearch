/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The FamilySearch authentication strategy authenticates requests by delegating to
 * FamilySearch using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `devKey`        FamilySearch Developer Key
 *   - `callbackURL`   URL to which FamilySearch will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new FamilySearchStrategy({
 *         devKey:      '123-456-789',
 *         callbackURL: 'https://www.example.net/auth/familysearch/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
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
  options.clientID = options.devKey;
  // FamilySearch requires an empty string, the _oauth2 library requires that it exist
  options.clientSecret = " ";
  options.authorizationURL = options.authorizationURL || 'https://ident.familysearch.org/cis-web/oauth2/v3/authorization';
  options.tokenURL = options.tokenURL || 'https://ident.familysearch.org/cis-web/oauth2/v3/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'familysearch';
  this._userProfileURL = options.userProfileURL || 'https://familysearch.org/platform/users/current';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Return extra FamilySearch-specific parameters to be included in the authorization
 * request.
 *
 * Options:
 *  - `signer`  Not needed unless FamilySearch specifically asked you to use client_secret.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function (options) {
  var params = {},
      signer = options.signer;

  if (signer) {
    params['client_secret'] = signer.clientSecret();
    this._oauth2._clientSecret = params['client_secret'];
  } else {
    this._oauth2._clientSecret = '';
  }

  return params;
};

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
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2._request("GET", this._userProfileURL, { authorization: "Bearer " + accessToken, accept: "application/json" }, "", "", function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {
      var jsonData = JSON.parse(body);
      var profile = { provider: 'familysearch' };
      var user = jsonData.users[0];
      profile.id = user.id;
      profile.contactName = user.contactName;
      profile.email = user.email;

      profile._raw = body;
      profile._json = jsonData;

      done(null, profile);
    } catch (e) {
      console.error("Failed to load user profile: ", e);
      done(e);
    }

  });
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;

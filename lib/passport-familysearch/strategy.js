/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2').Strategy
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;


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
 *   - `signer`        Not needed unless FamilySearch specifically asked you to use client_secret.
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
  this._userProfileURL = options.userProfileURL || 'https://api.familysearch.org/platform/users/current';
  this._signer = options.signer;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Wrap FamilySearch-specific signing to be used in the request
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  if (this._signer) {
    this._oauth2._clientSecret = this._signer();
  }
  return OAuth2Strategy.prototype.authenticate.apply(this, arguments);
};


/**
 * Return extra FamilySearch-specific parameters to be included in the authorization
 * request.
 *
 * Options:
 *  - `referrer`  Used to initiate an OpenID flow with a third party provider
 *  - `lowBandwidth`  Show a minimal low-bandwidth sign-in page instead of full sign in page
 *  - `userName`  Pre-populate the sign-in page with the provided userName
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function (options) {
  const params = {};

  if(this._signer) params.client_secret = this._signer();

  if(options.referrer) params.referrer = options.referrer;

  if(options.lowBandwidth){
    params.low_bandwidth = true;
  }

  if(options.userName) {
    params.userName = options.userName;
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

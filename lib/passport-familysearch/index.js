/**
 * Module dependencies.
 */
var LegacyStrategy = require('./legacy-strategy')
  , Strategy = require('./strategy')
  , OpenIDConnectStrategy = require('./openidconnect-strategy');


/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.OAuth1Strategy = exports.LegacyStrategy = LegacyStrategy;
exports.OAuth2Strategy = exports.Strategy = Strategy;
exports.OpenIDConnectStrategy = OpenIDConnectStrategy;

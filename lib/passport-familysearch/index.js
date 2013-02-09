/**
 * Module dependencies.
 */
var LegacyStrategy = require('./legacy-strategy')
  , Strategy = require('./strategy');


/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.LegacyStrategy = LegacyStrategy;
exports.Strategy = Strategy;

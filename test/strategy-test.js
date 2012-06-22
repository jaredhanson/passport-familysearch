var vows = require('vows');
var assert = require('assert');
var util = require('util');
var FamilySearchStrategy = require('passport-familysearch/strategy');


vows.describe('FamilySearchStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new FamilySearchStrategy({
        consumerKey: 'ABC123',
        consumerSecret: ''
      },
      function() {});
    },
    
    'should be named familysearch': function (strategy) {
      assert.equal(strategy.name, 'familysearch');
    },
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new FamilySearchStrategy({
        consumerKey: 'ABC123',
        consumerSecret: ''
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        if (url == 'https://api.familysearch.org/identity/v2/user?sessionId=token') {
          var body = '<?xml version=\'1.0\' encoding=\'UTF-8\'?><identity xmlns="http://api.familysearch.org/identity/v2" version="2.7.20120531.1616" statusMessage="OK" statusCode="200"><users><user id="XXXX-XXX0"><username>api-user-0000</username><names><name type="Display">Micheal Dickenson</name><name type="Family">Dickenson</name><name type="Given">Micheal</name></names><emails><email type="Primary">noreply@ldschurch.org</email><email type="Alternate" /></emails><member id="0001100101101" /></user></users></identity>';
          callback(null, body, undefined);
        } else {
          callback(new Error('something is wrong'));
        }
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'familysearch');
        assert.equal(profile.id, 'XXXX-XXX0');
        assert.equal(profile.username, 'api-user-0000');
        assert.equal(profile.displayName, 'Micheal Dickenson');
        assert.equal(profile.name.familyName, 'Dickenson');
        assert.equal(profile.name.givenName, 'Micheal');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set xml2js property' : function(err, profile) {
        assert.isObject(profile._xml2js);
        assert.strictEqual(profile._xml2json, profile._xml2js);
      },
    },
  },
  
  'strategy when loading user profile with a userProfileURL option': {
    topic: function() {
      var strategy = new FamilySearchStrategy({
        userProfileURL: 'https://sandbox.familysearch.org/identity/v2/user',
        consumerKey: 'ABC123',
        consumerSecret: ''
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        if (url == 'https://sandbox.familysearch.org/identity/v2/user?sessionId=token') {
          var body = '<?xml version=\'1.0\' encoding=\'UTF-8\'?><identity xmlns="http://api.familysearch.org/identity/v2" version="2.7.20120531.1616" statusMessage="OK" statusCode="200"><users><user id="XXXX-XXX0"><username>api-user-0000</username><names><name type="Display">Micheal Dickenson</name><name type="Family">Dickenson</name><name type="Given">Micheal</name></names><emails><email type="Primary">noreply@ldschurch.org</email><email type="Alternate" /></emails><member id="0001100101101" /></user></users></identity>';
          callback(null, body, undefined);
        } else {
          callback(new Error('something is wrong'));
        }
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'familysearch');
        assert.equal(profile.id, 'XXXX-XXX0');
        assert.equal(profile.username, 'api-user-0000');
        assert.equal(profile.displayName, 'Micheal Dickenson');
        assert.equal(profile.name.familyName, 'Dickenson');
        assert.equal(profile.name.givenName, 'Micheal');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set xml2js property' : function(err, profile) {
        assert.isObject(profile._xml2js);
        assert.strictEqual(profile._xml2json, profile._xml2js);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new FamilySearchStrategy({
        consumerKey: 'ABC123',
        consumerSecret: ''
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        callback(new Error('something went wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },

}).export(module);

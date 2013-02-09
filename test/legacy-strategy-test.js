var vows = require('vows');
var assert = require('assert');
var util = require('util');
var FamilySearchStrategy = require('../lib/passport-familysearch/legacy-strategy');


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
        if (url == 'https://api.familysearch.org/identity/v2/user?dataFormat=application/json&sessionId=token') {
          var body = '{"session":null,"users":[{"username":"api-user-0000","password":null,"names":[{"value":"Micheal Dickenson","type":"Display"},{"value":"Dickenson","type":"Family"},{"value":"Micheal","type":"Given"}],"emails":[{"value":"noreply@ldschurch.org","type":"Primary"},{"value":null,"type":"Alternate"}],"member":{"ward":null,"stake":null,"templeDistrict":null,"id":"0000000000000"},"id":"XXXX-XXX0","requestedId":null}],"authentication":null,"status":null,"version":"2.7.20120531.1616","statusCode":200,"statusMessage":"OK","deprecated":null}';
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
        assert.equal(profile.emails.length, 1);
        assert.equal(profile.emails[0].value, 'noreply@ldschurch.org');
        assert.equal(profile.emails[0].primary, true);
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
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
        if (url == 'https://sandbox.familysearch.org/identity/v2/user?dataFormat=application/json&sessionId=token') {
          var body = '{"session":null,"users":[{"username":"api-user-0000","password":null,"names":[{"value":"Micheal Dickenson","type":"Display"},{"value":"Dickenson","type":"Family"},{"value":"Micheal","type":"Given"}],"emails":[{"value":"noreply@ldschurch.org","type":"Primary"},{"value":null,"type":"Alternate"}],"member":{"ward":null,"stake":null,"templeDistrict":null,"id":"0000000000000"},"id":"XXXX-XXX0","requestedId":null}],"authentication":null,"status":null,"version":"2.7.20120531.1616","statusCode":200,"statusMessage":"OK","deprecated":null}';
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
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
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

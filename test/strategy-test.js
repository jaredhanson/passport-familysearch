var vows = require('vows');
var assert = require('assert');
var util = require('util');
var FamilySearchStrategy = require('../lib/passport-familysearch/strategy');

vows.describe('FamilySearchStrategy').addBatch({

  'strategy': {
    topic: function() {
      return new FamilySearchStrategy({
        devKey: 'ABC123'
      },
      function() {});
    },

    'should be named familysearch': function (strategy) {
      assert.equal(strategy.name, 'familysearch');
    }
  },

  'strategy when loading user profile': {
    topic: function() {
      var strategy = new FamilySearchStrategy({
        devKey: 'ABC123'
      },
      function() {});

      // mock
      strategy._oauth2._request = function(method, url, headers, post_body, access_token, callback) {
        if (url == 'https://familysearch.org/platform/users/current') {
          var body = '{"users":[{"id":"XXXX-XXX0","contactName":"Micheal Dickenson","email":"noreply@familysearch.org","links":{"self":{"href":"https://familysearch.org/platform/users/current"}}}]}';
          callback(null, body, undefined);
        } else {
          callback(new Error('something is wrong'));
        }
      };

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },

      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'familysearch');
        assert.equal(profile.id, 'XXXX-XXX0');
        assert.equal(profile.contactName, 'Micheal Dickenson');
        assert.equal(profile.email, 'noreply@familysearch.org');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      }
    }
  },

  'strategy when loading user profile with a userProfileURL option': {
    topic: function() {
      var strategy = new FamilySearchStrategy({
        userProfileURL: 'https://sandbox.familysearch.org/platform/users/current',
        devKey: 'ABC123'
      },
      function() {});

      // mock
      strategy._oauth2._request = function(method, url, headers, post_body, access_token, callback) {
        if (url == 'https://sandbox.familysearch.org/platform/users/current') {
          var body = '{"users":[{"id":"XXXX-XXX0","contactName":"Micheal Dickenson","email":"noreply@familysearch.org","links":{"self":{"href":"https://sandbox.familysearch.org/platform/users/current"}}}]}';
          callback(null, body, undefined);
        } else {
          callback(new Error('something is wrong'));
        }
      };

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },

      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'familysearch');
        assert.equal(profile.id, 'XXXX-XXX0');
        assert.equal(profile.contactName, 'Micheal Dickenson');
        assert.equal(profile.email, 'noreply@familysearch.org');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      }
    }
  },

  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new FamilySearchStrategy({
        devKey: 'ABC123'
      },
      function() {});

      // mock
      strategy._oauth2._request = function(method, url, headers, post_body, access_token, callback) {
        callback(new Error('something went wrong'));
      };

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('access-token', done);
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
      }
    }
  }

}).export(module);

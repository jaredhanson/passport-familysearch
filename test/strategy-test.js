'use strict';

const chai = require('chai');
chai.use(require('chai-passport-strategy'));
const expect = chai.expect;

const FamilySearchStrategy = require('../lib/passport-familysearch/strategy');
const InternalOAuthError = require('passport-oauth2').InternalOAuthError;

describe('FamilySearchStrategy', function () {
  let strategy;

  before(function (done) {
    strategy = new FamilySearchStrategy({
      devKey: 'ABC123'
    }, function () {});

    chai.passport.use(strategy)
      .redirect(function (redirectUrl, status) {
        // console.log('redirect', redirectUrl, status);
        done();
      })
      .authenticate();
  });

  it('should be named familysearch', function () {
    expect(strategy.name).to.eql('familysearch');
  });

  it('should load user profile', function (done) {
    strategy._oauth2._request = function (method, url, headers, post_body, access_token, callback) {
      if (url === 'https://api.familysearch.org/platform/users/current') {
        const body = '{"users":[{"id":"XXXX-XXX0","contactName":"Some Person","email":"noreply@familysearch.org","links":{"self":{"href":"https://api.familysearch.org/platform/users/current"}}}]}';
        callback(null, body, undefined);
      } else {
        callback(new Error('something is wrong'));
      }
    };

    process.nextTick(function () {
      strategy.userProfile('access-token', function (err, profile) {
        expect(err).to.not.exist;
        expect(profile.provider).to.eql('familysearch');
        expect(profile.id).to.eql('XXXX-XXX0');
        expect(profile.contactName).to.eql('Some Person');
        expect(profile.email).to.eql('noreply@familysearch.org');
        expect(profile._raw).to.be.a('string');
        expect(profile._json).to.be.an('object');

        done();
      });
    });

  });

  it('should load user profile via userProfileURL property', function (done) {
    strategy = new FamilySearchStrategy({
      userProfileURL: 'https://api-integ.familysearch.org/platform/users/current',
      devKey: 'ABC123'
    }, function () {});

    strategy._oauth2._request = function (method, url, headers, post_body, access_token, callback) {
      if (url === 'https://api-integ.familysearch.org/platform/users/current') {
        const body = '{"users":[{"id":"ABCD-1234","contactName":"Sandbox Account","email":"noreply@familysearch.org","links":{"self":{"href":"https://api-integ.familysearch.org/platform/users/current"}}}]}';
        callback(null, body, undefined);
      } else {
        callback(new Error('something is wrong'));
      }
    };

    process.nextTick(function () {
      strategy.userProfile('access-token', function (err, profile) {
        expect(err).to.not.exist;
        expect(profile.provider).to.eql('familysearch');
        expect(profile.id).to.eql('ABCD-1234');
        expect(profile.contactName).to.eql('Sandbox Account');
        expect(profile.email).to.eql('noreply@familysearch.org');
        expect(profile._raw).to.be.a('string');
        expect(profile._json).to.be.an('object');

        done();
      });
    });

  });

  it('should handle errors when loading user profile', function (done) {
    strategy._oauth2._request = function (method, url, headers, post_body, access_token, callback) {
      callback(new Error('Profile loading error'));
    };

    process.nextTick(function () {
      strategy.userProfile('access-token', function (err, profile) {
        expect(err).to.be.an.instanceof(InternalOAuthError);
        expect(err).to.match(/Profile loading error/);
        expect(profile).to.not.exist;

        done();
      });
    });
  });

  it('should handle malformed response when loading user profile', function (done) {
    strategy._oauth2._request = function (method, url, headers, post_body, access_token, callback) {
      callback(null, '<html><body>Not Found</body>');
    };

    process.nextTick(function () {
      strategy.userProfile('access-token', function (err, profile) {
        expect(err).to.be.an.instanceof(SyntaxError);
        expect(err).to.match(/Unexpected token/);
        expect(profile).to.not.exist;

        done();
      });
    });
  });

});

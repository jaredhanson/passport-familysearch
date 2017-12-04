var expect = require('chai').expect;

var familysearch = require('..');

describe('passport-familysearch', function () {

  it('should report a version', function () {
    expect(familysearch.version).to.be.a('string');
  });

});

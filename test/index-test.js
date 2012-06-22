var vows = require('vows');
var assert = require('assert');
var util = require('util');
var familysearch = require('passport-familysearch');


vows.describe('passport-familysearch').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(familysearch.version);
    },
  },
  
}).export(module);

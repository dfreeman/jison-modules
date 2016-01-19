'use strict';

var assert = require('chai').assert;
var prefixify = require('../../../lib/utils/prefixify');

describe('prefixify', function() {
  it('inserts underscores to separate the prefix from the identifier', function() {
    assert.equal(prefixify('foobar'), 'foobar__');
  });

  it('converts identifier-unsafe characters', function() {
    assert.equal(prefixify('foo/bar-baz'), 'foo$bar$baz__');
  });
});

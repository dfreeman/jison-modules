'use strict';

var assert = require('chai').assert;
var parse = require('../../../lib/parsers/precedence-declaration').parse;

describe('PrecedenceDeclarationParser', function() {
  it('parses left associative declarations', function() {
    assert.deepEqual(parse('%precedence[left, 5] foo bar'), {
      associativity: 'left',
      priority: 5,
      body: ['foo', 'bar']
    });
  });

  it('parses right associative declarations', function() {
    assert.deepEqual(parse('%precedence[right, 100] some other tokens'), {
      associativity: 'right',
      priority: 100,
      body: ['some', 'other', 'tokens']
    });
  });

  it('parses nonassociative declarations', function() {
    assert.deepEqual(parse('%precedence[nonassoc, 0] x'), {
      associativity: 'nonassoc',
      priority: 0,
      body: ['x']
    });
  });

  it('rejects unknown associativity declarations', function() {
    assert.throws(function() {
      parse('%precedence[fizzle, 1] foo');
    });
  });

  it('rejects declarations missing a priority', function() {
    assert.throws(function() {
      parse('%precedence[left] foo');
    });
  });
});

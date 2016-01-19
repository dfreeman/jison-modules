'use strict';

var assert = require('chai').assert;
var parse = require('../../../lib/parsers/module-declaration').parse;

describe('ModuleDeclarationParser', function() {
  it('parses default exports', function() {
    assert.deepEqual(parse('%export default foo'), {
      type: 'Export',
      bindings: [
        { source: 'foo', binding: 'default' }
      ]
    });
  });

  it('parses lexical exports', function() {
    assert.deepEqual(parse('%export lex { x, y as z }'), {
      type: 'Export',
      lexical: true,
      bindings: [
        { source: 'x', binding: 'x' },
        { source: 'y', binding: 'z' }
      ]
    });
  });

  it('parses named exports', function() {
    assert.deepEqual(parse('%export { foo as bar, baz }'), {
      type: 'Export',
      bindings: [
        { source: 'foo', binding: 'bar' },
        { source: 'baz', binding: 'baz' }
      ]
    });
  });

  it('rejects named lexical exports', function() {
    assert.throws(function() {
      parse('%export default lex foo');
    });
  });

  it('parses default imports', function() {
    assert.deepEqual(parse('%import foo from "bar/baz"'), {
      type: 'Import',
      module: 'bar/baz',
      bindings: [
        { source: 'default', binding: 'foo' }
      ]
    });
  });

  it('parses named imports', function() {
    assert.deepEqual(parse('%import { foo, bar as baz } from "fizzbuzz"'), {
      type: 'Import',
      module: 'fizzbuzz',
      bindings: [
        { source: 'foo', binding: 'foo' },
        { source: 'bar', binding: 'baz' }
      ]
    });
  });

  it('parses complex imports', function() {
    assert.deepEqual(parse('%import foo, { bar } from "baz/qux"'), {
      type: 'Import',
      module: 'baz/qux',
      bindings: [
        { source: 'default', binding: 'foo' },
        { source: 'bar', binding: 'bar' }
      ]
    });
  });

  it('parses lexical imports', function() {
    assert.deepEqual(parse('%import lex { x, y as z } from "supercool"'), {
      type: 'Import',
      lexical: true,
      module: 'supercool',
      bindings: [
        { source: 'x', binding: 'x' },
        { source: 'y', binding: 'z' }
      ]
    });
  });

  it('rejects default lexical imports', function() {
    assert.throws(function() {
      parse('%import lex foo from "bar"');
    });
  });
});

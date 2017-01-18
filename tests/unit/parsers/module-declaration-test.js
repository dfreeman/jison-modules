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

  it('parses named exports', function() {
    assert.deepEqual(parse('%export { foo as bar, baz }'), {
      type: 'Export',
      bindings: [
        { source: 'foo', binding: 'bar' },
        { source: 'baz', binding: 'baz' }
      ]
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

  it('parses bindingless imports', function() {
    assert.deepEqual(parse('%import "fizzbuzz"'), {
      type: 'Import',
      module: 'fizzbuzz',
      bindings: []
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
});

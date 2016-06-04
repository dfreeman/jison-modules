'use strict';
/* eslint camelcase:[2,{"properties":"never"}] */

var assert = require('chai').assert;
var testModule = require('../helpers/test-module');

var rewriteModule = require('../../lib/rewrite-module');

describe('rewriteModule', function() {
  it('accepts modules with no defined lexicon', function() {
    var mod = testModule('dir/mod', { lexicon: null });
    delete mod.lexicon;

    rewriteModule(mod);

    assert.equal(mod.name, 'dir/mod');
  });

  it('namespaces lexical start conditions and rules that reference them', function() {
    var mod = testModule('dir/mod', {
      lexicon: {
        startConditions: {
          foo: 1,
          bar: 0
        },
        rules: [
          [['INITIAL', 'foo', 'bar'], 'x', 'return']
        ]
      }
    });

    rewriteModule(mod);

    assert.deepEqual(mod.lexicon.startConditions, {
      dir$mod__foo: 1,
      dir$mod__bar: 0
    });

    assert.deepEqual(mod.lexicon.rules, [
      [['INITIAL', 'dir$mod__foo', 'dir$mod__bar'], 'x', 'return jisonModules_prefix(this, "dir$mod__", function() {\nreturn\n});']
    ]);
  });

  it('namespaces lexical macro definitions and their usage', function() {
    var mod = testModule('dir/mod', {
      lexicon: {
        macros: {
          X: 'a-z',
          Y: '{X}{X}'
        },
        rules: [
          ['"a"{X}"b"', 'return true;'],
          [[], '{X}[1-9]{Y}', 'return true;']
        ]
      }
    });

    rewriteModule(mod);

    assert.deepEqual(mod.lexicon.macros, {
      dir$mod__X: 'a-z',
      dir$mod__Y: '{dir$mod__X}{dir$mod__X}'
    });

    assert.deepEqual(mod.lexicon.rules, [
      ['"a"{dir$mod__X}"b"', 'return jisonModules_prefix(this, "dir$mod__", function() {\nreturn true;\n});'],
      [[], '{dir$mod__X}[1-9]{dir$mod__Y}', 'return jisonModules_prefix(this, "dir$mod__", function() {\nreturn true;\n});']
    ]);
  });

  it('namespaces lexical token references in precedence declarations', function() {
    var mod = testModule('dir/mod', {
      imports: [
        { module: 'dir/child/other', source: 'src', binding: 'b' }
      ],
      precedence: [
        { associativity: 'left', priority: 3, tokens: ['a', 'b'] },
        { associativity: 'right', priority: 10, tokens: ['c'] }
      ]
    });

    rewriteModule(mod, {
      'dir/child/other': {
        src: { binding: 'src', source: 'internal' }
      }
    });

    assert.deepEqual(mod.precedence, [
      { associativity: 'left', priority: 3, tokens: ['dir$mod__a', 'dir$child$other__internal'] },
      { associativity: 'right', priority: 10, tokens: ['dir$mod__c'] }
    ]);
  });

  it('namespaces the start rule', function() {
    var mod = testModule('dir/mod', {
      grammar: {
        start: 'foo'
      }
    });

    rewriteModule(mod);

    assert.equal(mod.grammar.start, 'dir$mod__foo');
  });

  it('namespaces references to local and imported grammar rules', function() {
    var mod = testModule('dir/mod', {
      imports: [
        { module: 'dir/child/other', source: 'src', binding: 'fiddle' },
        { module: 'dir/child/another', source: 'xxx', binding: 'qux' }
      ],
      grammar: {
        bnf: {
          foo: ['bar', ['baz qux', 'return true;'], ''],
          bar: [['x', 'return false;', { prec: 'fiddle' }]],
          baz: ['foo', ['bar', { prec: 'foo' }]]
        }
      }
    });

    rewriteModule(mod, {
      'dir/child/other': {
        src: { binding: 'src', source: 'internal' }
      },
      'dir/child/another': {
        xxx: { binding: 'xxx', source: 'yyy' }
      }
    });

    assert.deepEqual(mod.grammar.bnf, {
      dir$mod__foo: ['dir$mod__bar', ['dir$mod__baz dir$child$another__yyy', 'return true;'], ''],
      dir$mod__bar: [['dir$mod__x', 'return false;', { prec: 'dir$child$other__internal' }]],
      dir$mod__baz: ['dir$mod__foo', ['dir$mod__bar', { prec: 'dir$mod__foo' }]]
    });
  });
});

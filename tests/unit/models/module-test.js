'use strict';

var assert = require('chai').assert;
var TestLoader = require('../../helpers/test-loader');
var Module = require('../../../lib/models/module');

var pick = require('lodash/object/pick');

describe('Module', function() {
  it('knows its name and raw grammar and lexicon definitions', function() {
    var options = loader.load('explicitPriority');
    var module = new Module('module-name', options);

    assert.equal(module.name, 'module-name');
    assert.equal(module.grammar, options.grammar);
    assert.equal(module.lexicon, options.lexicon);
  });

  it('rejects grammars with unprioritized operators', function() {
    var options = loader.load('unprioritizedOperators');

    assert.throws(function() {
      return new Module(null, options);
    }, /%precedence/);
  });

  it('assigns the global default priority when none is specified in the module', function() {
    var module = new Module(null, loader.load('noPriority'));
    assert.equal(module.priority, Module.DEFAULT_PRIORITY);
  });

  it('assigns a configured default priority when none is specified in the module', function() {
    var options = loader.load('noPriority');
    options.defaultPriority = 200;
    var module = new Module(null, options);
    assert.equal(module.priority, 200);
  });

  it('extracts priority from the lexicon when specified', function() {
    var module = new Module(null, loader.load('explicitPriority'));
    assert.equal(module.priority, 10);
  });

  it('extracts unknown grammar and lexicon declarations', function() {
    var module = new Module(null, loader.load('unknownDecls'));
    assert.deepEqual(module.lexiconDecls, ['%foo bar']);
    assert.deepEqual(module.grammarDecls, ['%baz qux']);
  });

  it('extracts import declarations from the grammar', function() {
    var module = new Module(null, loader.load('imports'));
    var imports = module.imports.map(function(imp) {
      return pick(imp, 'module', 'source', 'binding', 'lexical');
    });

    assert.deepEqual(imports, [
      { module: 'qux', source: 'default', binding: 'foo', lexical: false },
      { module: 'qux', source: 'bar', binding: 'baz', lexical: false },
      { module: 'xyz', source: 'abc', binding: 'abc', lexical: false },
      { module: 'other', source: 'x', binding: 'x', lexical: true },
      { module: 'other', source: 'y', binding: 'z', lexical: true }
    ]);
  });

  it('extracts export declarations from the grammar', function() {
    var module = new Module(null, loader.load('exports'));
    var exports = module.exports.map(function(exp) {
      return pick(exp, 'source', 'binding', 'lexical');
    });

    assert.deepEqual(exports, [
      { source: 'foo', binding: 'default', lexical: false },
      { source: 'a', binding: 'a', lexical: false },
      { source: 'b', binding: 'c', lexical: false },
      { source: 'x', binding: 'x', lexical: true },
      { source: 'y', binding: 'z', lexical: true }
    ]);
  });

  it('extracts precedence declarations from the grammar', function() {
    var module = new Module(null, loader.load('precedence'));
    var precedence = module.precedence.map(function(prec) {
      return pick(prec, 'priority', 'associativity', 'tokens');
    });

    assert.deepEqual(precedence, [
      { priority: 5, associativity: 'left', tokens: ['foo'] },
      { priority: 4, associativity: 'right', tokens: ['bar baz', 'qux'] }
    ]);
  });
});

var loader = new TestLoader({
  modules: {
    unprioritizedOperators: [
      '%left foo  ',
      '%%         ',
      'start: X;  '
    ],

    noPriority: [
      '%%        ',
      'start: X; '
    ],

    explicitPriority: {
      l: [
        '%priority 10 ',
        '%%           ',
        'x return "x" '
      ],
      y: [
        '%%        ',
        'start: X; '
      ]
    },

    unknownDecls: {
      l: [
        '%foo bar     ',
        '%%           ',
        'x return "x" '
      ],
      y: [
        '%baz qux  ',
        '%%        ',
        'start: X; '
      ]
    },

    imports: [
      '%import foo, { bar as baz } from "qux" ',
      '%import { abc } from "xyz"             ',
      '%import lex { x, y as z } from "other" ',
      '%%                                     ',
      'start: X;                              '
    ],

    exports: [
      '%export default foo       ',
      '%export { a, b as c }     ',
      '%export lex { x, y as z } ',
      '%%                        ',
      'start: X;                 '
    ],

    precedence: [
      '%precedence[left, 5] foo            ',
      '%precedence[right, 4] "bar baz" qux ',
      '%%                                  ',
      'start: X;                           '
    ]
  }
});

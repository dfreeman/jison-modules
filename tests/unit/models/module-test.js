'use strict';

var assert = require('chai').assert;
var TestLoader = require('../../helpers/test-loader');
var Module = require('../../../lib/models/module');

var pick = require('lodash/object/pick');

describe('Module', function() {
  it('knows its name and raw grammar and lexicon definitions', function() {
    return loader.load('explicitPriority').then(function(options) {
      var module = new Module('module-name', options);

      assert.equal(module.name, 'module-name');
      assert.equal(module.grammar, options.grammar);
      assert.equal(module.lexicon, options.lexicon);
    });
  });

  it('rejects grammars with unprioritized operators', function() {
    return loader.load('unprioritizedOperators').then(function(options) {
      assert.throws(function() {
        return new Module(null, options);
      }, /%precedence/);
    });
  });

  it('rejects grammars with multiple priorities declared', function() {
    return loader.load('multiPriority').then(function(options) {
      assert.throws(function() {
        return new Module(null, options);
      }, /multiple priority declarations/i);
    });
  });

  it('rejects a grammar with a non-numeric priority declaration', function() {
    return loader.load('badPriority').then(function(options) {
      assert.throws(function() {
        return new Module(null, options);
      }, /invalid priority/i);
    });
  });

  it('assigns the global default priority when none is specified in the module', function() {
    return loader.load('noPriority').then(function(options) {
      var module = new Module(null, options);
      assert.equal(module.priority, Module.DEFAULT_PRIORITY);
    });
  });

  it('assigns a configured default priority when none is specified in the module', function() {
    return loader.load('noPriority').then(function(options) {
      options.defaultPriority = 200;
      var module = new Module(null, options);
      assert.equal(module.priority, 200);
    });
  });

  it('extracts priority from the lexicon when specified', function() {
    return loader.load('explicitPriority').then(function(options) {
      var module = new Module(null, options);
      assert.equal(module.priority, 10);
    });
  });

  it('extracts unknown grammar and lexicon declarations', function() {
    return loader.load('unknownDecls').then(function(options) {
      var module = new Module(null, options);
      assert.deepEqual(module.lexiconDecls, ['%foo bar']);
      assert.deepEqual(module.grammarDecls, ['%baz qux']);
    });
  });

  it('extracts import declarations from the grammar', function() {
    return loader.load('imports').then(function(options) {
      var module = new Module(null, options);
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
  });

  it('extracts export declarations from the grammar', function() {
    return loader.load('exports').then(function(options) {
      var module = new Module(null, options);
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
  });

  it('extracts precedence declarations from the grammar', function() {
    return loader.load('precedence').then(function(options) {
      var module = new Module(null, options);
      var precedence = module.precedence.map(function(prec) {
        return pick(prec, 'priority', 'associativity', 'tokens');
      });

      assert.deepEqual(precedence, [
        { priority: 5, associativity: 'left', tokens: ['foo'] },
        { priority: 4, associativity: 'right', tokens: ['bar baz', 'qux'] }
      ]);
    });
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

    multiPriority: {
      l: [
        '%priority 10 ',
        '%priority 20 ',
        '%%           ',
        'x return "x" '
      ],
      y: [
        '%%        ',
        'start: X; '
      ]
    },

    badPriority: {
      l: [
        '%priority xx ',
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

    imports: {
      l: [
        '%import { x, y as z } from "other" ',
        '%%                                 ',
        'a return "a";                      '
      ],
      y: [
        '%import foo, { bar as baz } from "qux" ',
        '%import { abc } from "xyz"             ',
        '%%                                     ',
        'start: X;                              '
      ]
    },

    exports: {
      l: [
        '%export { x, y as z } ',
        '%%                    ',
        'a return "a";         '
      ],
      y: [
        '%export default foo       ',
        '%export { a, b as c }     ',
        '%%                        ',
        'start: X;                 '
      ]
    },

    precedence: [
      '%precedence[left, 5] foo            ',
      '%precedence[right, 4] "bar baz" qux ',
      '%%                                  ',
      'start: X;                           '
    ]
  }
});

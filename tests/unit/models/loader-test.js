'use strict';

var assert = require('chai').assert;
var Loader = require('../../../lib/models/loader');

describe('Loader', function() {
  it('loads embedded lexicons', function() {
    var result = new TestLoader().load('embeddedLexicon');

    // Don't bother double checking the embedded `lex` – that's not actually part of the interface
    delete result.grammar.lex;

    assert.deepEqual(result.grammar, {
      bnf: {
        start: ['X']
      }
    });

    assert.deepEqual(result.lexicon, {
      rules: [
        [
          '[x]',
          'return "X";'
        ]
      ]
    });
  });

  it('loads external lexicons', function() {
    var result = new TestLoader().load('externalLexicon');

    assert.deepEqual(result.grammar, {
      bnf: {
        start: ['X']
      }
    });

    assert.deepEqual(result.lexicon, {
      rules: [
        [
          '[x]',
          'return "X";'
        ]
      ]
    });
  });

  it('has a default implementation for resolvePath', function() {
    var loader = new TestLoader();
    assert.equal(loader.resolvePath('base', 'relative'), 'relative');
  });

  it('throws an exception for modules without a grammar', function() {
    assert.throws(function() {
      new TestLoader().load('no-such-module');
    }, /unknown module/i);
  });

  it('allows modules without a lexicon', function() {
    var result = new TestLoader().load('grammarOnly');
    assert.deepEqual(result.lexicon, undefined);
  });

  it('throws an exception if a module has both an embedded and external lexicon', function() {
    assert.throws(function() {
      new TestLoader().load('doubleLexicon');
    }, /embedded and external/);
  });
});

var TestLoader = Loader.extend({
  readLexicon: function(path) {
    var mod = FIXTURES[path];
    return mod && mod.l;
  },

  readGrammar: function(path) {
    var mod = FIXTURES[path];
    return mod && mod.y;
  }
});

function trim(str) {
  return str && str.trim();
}

var FIXTURES = {
  embeddedLexicon: {
    y: [
      '%lex            ',
      '%%              ',
      '[x] return "X"; ',
      '/lex            ',
      '%%              ',
      'start: X;       '
    ].map(trim).join('\n')
  },

  externalLexicon: {
    l: [
      '%%              ',
      '[x] return "X"; '
    ].map(trim).join('\n'),
    y: [
      '%%              ',
      'start: X;       '
    ].map(trim).join('\n')
  },

  grammarOnly: {
    y: [
      '%%              ',
      'start: X;       '
    ].map(trim).join('\n')
  },

  doubleLexicon: {
    l: [
      '%%              ',
      '[x] return "X"; '
    ].map(trim).join('\n'),
    y: [
      '%lex            ',
      '%%              ',
      '[x] return "X"; ',
      '/lex            ',
      '%%              ',
      'start: X;       '
    ].map(trim).join('\n')
  }
};

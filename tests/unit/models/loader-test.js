'use strict';

var assert = require('chai').assert;
var TestLoader = require('../../helpers/test-loader');

describe('Loader', function() {
  it('loads embedded lexicons', function() {
    var result = new TestLoader({ modules: FIXTURES }).load('embeddedLexicon');

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
    var result = new TestLoader({ modules: FIXTURES }).load('externalLexicon');

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
    var loader = new TestLoader({ modules: FIXTURES });
    assert.equal(loader.resolvePath('base', 'relative'), 'relative');
  });

  it('throws an exception for modules without a grammar', function() {
    assert.throws(function() {
      new TestLoader({ modules: FIXTURES }).load('no-such-module');
    }, /unknown module/i);
  });

  it('allows modules without a lexicon', function() {
    var result = new TestLoader({ modules: FIXTURES }).load('grammarOnly');
    assert.deepEqual(result.lexicon, undefined);
  });

  it('throws an exception if a module has both an embedded and external lexicon', function() {
    assert.throws(function() {
      new TestLoader({ modules: FIXTURES }).load('doubleLexicon');
    }, /embedded and external/);
  });
});

var FIXTURES = {
  embeddedLexicon: {
    y: [
      '%lex            ',
      '%%              ',
      '[x] return "X"; ',
      '/lex            ',
      '%%              ',
      'start: X;       '
    ]
  },

  externalLexicon: {
    l: [
      '%%              ',
      '[x] return "X"; '
    ],
    y: [
      '%%              ',
      'start: X;       '
    ]
  },

  grammarOnly: {
    y: [
      '%%              ',
      'start: X;       '
    ]
  },

  doubleLexicon: {
    l: [
      '%%              ',
      '[x] return "X"; '
    ],
    y: [
      '%lex            ',
      '%%              ',
      '[x] return "X"; ',
      '/lex            ',
      '%%              ',
      'start: X;       '
    ]
  }
};

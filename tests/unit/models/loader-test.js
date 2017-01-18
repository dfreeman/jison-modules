'use strict';

var assert = require('chai').assert;
var TestLoader = require('../../helpers/test-loader');

require('chai').use(require('chai-as-promised'));

var Loader = require('../../../lib/models/loader');

describe('Loader', function() {
  it('requires subclasses to implement readLexicon', function() {
    var BadLoader = Loader.extend({
      readGrammar: function() {
        return '%%\nx:y;';
      }
    });

    return assert.isRejected(new BadLoader().load('test'), /implement `readLexicon`/);
  });

  it('requires subclasses to implment readGrammar', function() {
    var BadLoader = Loader.extend({
      readLexicon: function() {}
    });

    return assert.isRejected(new BadLoader().load('test'), /implement `readGrammar`/);
  });

  it('loads embedded lexicons', function() {
    return new TestLoader({ modules: FIXTURES }).load('embeddedLexicon').then(function(result) {
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
  });

  it('loads external lexicons', function() {
    return new TestLoader({ modules: FIXTURES }).load('externalLexicon').then(function(result) {
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
  });

  it('has a default implementation for resolvePath', function() {
    var loader = new TestLoader({ modules: FIXTURES });
    assert.equal(loader.resolvePath('base', 'relative'), 'relative');
  });

  it('throws an exception for modules without a grammar or lexicon', function() {
    return assert.isRejected(new TestLoader({ modules: FIXTURES }).load('no-such-module'), /no grammar or lexicon found/i);
  });

  it('allows modules without a lexicon', function() {
    return new TestLoader({ modules: FIXTURES }).load('grammarOnly').then(function(result) {
      assert.ok('lexicon' in result);
      assert.equal(result.lexicon, undefined);
    });
  });

  it('allows modules without a grammar', function() {
    return new TestLoader({ modules: FIXTURES }).load('lexiconOnly').then(function(result) {
      assert.ok('grammar' in result);
      assert.equal(result.grammar, undefined);
    });
  });

  it('throws an exception if a module has both an embedded and external lexicon', function() {
    return assert.isRejected(new TestLoader({ modules: FIXTURES }).load('doubleLexicon'), /embedded and external/);
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

  lexiconOnly: {
    l: [
      '%%              ',
      '[x] return "X"; '
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

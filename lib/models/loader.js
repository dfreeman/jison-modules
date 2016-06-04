'use strict';

var CoreObject = require('core-object');
var EBNFParser = require('ebnf-parser');
var LexParser = require('lex-parser');

/**
 * A class capable of locating and loading modules based on paths relative to one
 * another. Options:
 *  - grammarParser (optional) The parser to use when constructing the grammar's
 *    JSON representation. Defaults to Jison's standard ebnf-parser with a tweak
 *    to collect unknown declarations.
 *  - lexiconParser (optional) The parser to use when constructing the lexicon's
 *    JSON representation. Defaults to Jison's standard lex-parser with a tweak
 *    to collect unknown declarations.
 */
module.exports = CoreObject.extend({
  grammarParser: EBNFParser,
  lexiconParser: LexParser,

  /**
   * Given an absolute path for a module, returns a string representation of the
   * grammar for that module (or a promise for the same), to be passed off to this
   * loader's configured grammar parser.
   */
  readGrammar: function(modulePath) {
    return Promise.reject(new Error('A loader must implement `readGrammar` or override `load`'));
  },

  /**
   * Given an absolute path for a module, returns a string representation of the
   * lexicon for that module (or a promise for the same), to be passed off to this
   * loader's configured lexicon parser.
   */
  readLexicon: function(modulePath) {
    return Promise.reject(new Error('A loader must implement `readLexicon` or override `load`'));
  },

  /**
   * Given an absolute path to one module and a relative path to another,
   * returns an absolute path for the latter. May be a no-op on the relative
   * path in scenarios where modules are always referred to by a canonical name.
   */
  resolvePath: function(basePath, relativePath) {
    return relativePath;
  },

  /**
   * Given an absolute path for a module, returns the JSON representation of
   * that module's grammar and, if present, lexicon.
   *
   * This method should raise an exception if no such module exists.
   */
  load: function(modulePath) {
    return this._loadGrammar(modulePath).then(function(grammar) {
      return this._loadLexicon(grammar, modulePath).then(function(lexicon) {
        return { grammar: grammar, lexicon: lexicon };
      });
    }.bind(this));
  },

  _loadGrammar: function(modulePath) {
    return Promise.resolve(this.readGrammar(modulePath)).then(function(grammarSource) {
      if (!grammarSource) throw new Error('Unknown module: ' + modulePath);
      return this.grammarParser.parse(grammarSource);
    }.bind(this));
  },

  _loadLexicon: function(grammar, modulePath) {
    return Promise.resolve(this.readLexicon(modulePath)).then(function(lexiconSource) {
      if (lexiconSource && grammar.lex) {
        throw new Error('Module ' + modulePath + ' has both an embedded and external lexicon');
      }
      return grammar.lex || (lexiconSource && this.lexiconParser.parse(lexiconSource));
    }.bind(this));
  }
});

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
 *    JSON representation. Defaults to Jison's standard lex-parser.
 */
module.exports = CoreObject.extend({
  grammarParser: EBNFParser,
  lexiconParser: LexParser,

  /**
   * Given an absolute path for a module, returns a string representation of the
   * grammar for that module, to be passed off to this loader's configured
   * grammar parser.
   */
  readGrammar: function(modulePath) {
    throw new Error('A loader must implement `readGrammar` or override `load`');
  },

  /**
   * Given an absolute path for a module, returns a string representation of the
   * lexicon for that module, to be passed off to this loader's configured
   * lexicon parser.
   */
  readLexicon: function(modulePath) {
    throw new Error('A loader must implement `readLexicon` or override `load`');
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
    var grammar = this._loadGrammar(modulePath);
    var lexicon = this._loadLexicon(grammar, modulePath);
    return { grammar: grammar, lexicon: lexicon };
  },

  _loadGrammar: function(modulePath) {
    var grammarSource = this.readGrammar(modulePath);
    if (!grammarSource) throw new Error('Unknown module: ' + modulePath);
    return this.grammarParser.parse(grammarSource);
  },

  _loadLexicon: function(grammar, modulePath) {
    var lexiconSource = this.readLexicon(modulePath);
    if (lexiconSource && grammar.lex) {
      throw new Error('Module ' + modulePath + ' has both an embedded and external lexicon');
    }
    return grammar.lex || (lexiconSource && this.lexiconParser.parse(lexiconSource));
  }
});

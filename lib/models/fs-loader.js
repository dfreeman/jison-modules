var path = require('path');
var fs = require('fs');

var Loader = require('./loader');

/*
 * Resolves modules as files in a file system, using standard relative path semantics
 * and synchronous FS reads. Options (in addition to those of the base Loader):
 *  - encoding (optional) The character encoding used when reading module files.
 *    Defaults to UTF-8.
 *  - grammarExtension (optional) The file extension that grammar files will be assumed
 *    to have. Defaults to 'y'.
 *  - lexiconExtension (optional) The file extension that lexicon files will be assumed
 *    to have. Defaults to 'l'.
 */
module.exports = Loader.extend({
  encoding: 'utf-8',

  grammarExtension: 'y',
  lexiconExtension: 'l',

  resolvePath: function(baseFile, relativePath) {
    return path.resolve(path.dirname(baseFile), relativePath);
  },

  readGrammar: function(path) {
    try {
      return fs.readFileSync(path + '.' + this.grammarExtension, this.encoding);
    } catch (e) {
      return null;
    }
  },

  readLexicon: function(path) {
    try {
      return fs.readFileSync(path + '.' + this.lexiconExtension, this.encoding);
    } catch (e) {
      return null;
    }
  }
});

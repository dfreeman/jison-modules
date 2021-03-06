'use strict';

var path = require('path');
var fs = require('fs');

var Loader = require('./loader');

/*
 * Resolves modules as files in a file system, using standard relative path semantics
 * and synchronous FS reads. Options (in addition to those of the base Loader):
 *  - encoding (optional) The character encoding used when reading module files.
 *    Defaults to UTF-8.
 *  - baseDirectory (optional) A root directory relative to which the entry point and
 *    all non-relative imports will be resolved. Defaults to the working directory.
 *  - grammarExtension (optional) The file extension that grammar files will be assumed
 *    to have. Defaults to 'y'.
 *  - lexiconExtension (optional) The file extension that lexicon files will be assumed
 *    to have. Defaults to 'l'.
 */
module.exports = Loader.extend({
  encoding: 'utf-8',

  grammarExtension: 'y',
  lexiconExtension: 'l',

  baseDirectory: process.cwd(),

  resolvePath: function(baseFile, relativePath) {
    if (RELATIVE_TO_SOURCE.test(relativePath)) {
      return path.resolve(path.dirname(baseFile), relativePath);
    } else {
      return relativePath;
    }
  },

  readGrammar: function(grammarPath) {
    try {
      return this._readFile(grammarPath + '.' + this.grammarExtension);
    } catch (e) {
      return null;
    }
  },

  readLexicon: function(lexiconPath) {
    try {
      return this._readFile(lexiconPath + '.' + this.lexiconExtension);
    } catch (e) {
      return null;
    }
  },

  _readFile: function(file) {
    var fullPath = path.isAbsolute(file) ? file : path.join(this.baseDirectory, file);
    return fs.readFileSync(fullPath, this.encoding);
  }
});

var RELATIVE_TO_SOURCE = new RegExp('^\\.\\.?' + path.sep);

'use strict';

var Loader = require('../../lib/models/loader');

module.exports = Loader.extend({
  readLexicon: function(path) {
    var mod = this.modules[path];
    return mod && text(mod.l);
  },

  readGrammar: function(path) {
    var mod = this.modules[path];
    return mod && text(mod.y) || text(mod);
  }
});

function text(lines) {
  if (!lines || !lines.map) return undefined;

  return lines.map(function(string) {
    return string.trim();
  }).join('\n');
}

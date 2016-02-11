'use strict';

var transform = require('lodash/object/transform');

var prefixify = require('./lib/utils/prefixify');
var loadModuleGraph = require('./lib/load-module-graph');
var validateDependencies = require('./lib/validate-dependencies');
var rewriteModule = require('./lib/rewrite-module');
var composeGrammar = require('./lib/compose-grammar');

/**
 * Takes an entry path, a loader, and a hash of options, and returns a composed
 * JSON-format Jison grammar, along with additional metadata about the individual
 * modules composing that grammar.
 */
module.exports = function loadGrammar(entryPath, loader, options) {
  var modules = loadModuleGraph(entryPath, loader, options);
  var exportMap = validateDependencies(modules);

  modules.forEach(function(module) {
    rewriteModule(module, exportMap);
  });

  var meta = buildMeta(modules);
  var grammar = composeGrammar(entryPath, modules);

  return { grammar: grammar, meta: meta };
};


function buildMeta(modules) {
  return {
    modules: transform(modules, function(hash, module) {
      hash[module.name] = {
        prefix: prefixify(module.name),
        exports: module.exports,
        grammarDecls: module.grammarDecls,
        lexiconDecls: module.lexiconDecls
      };
    }, {})
  };
}

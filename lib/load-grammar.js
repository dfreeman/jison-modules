'use strict';

var transform = require('lodash/object/transform');

var prefixify = require('./utils/prefixify');
var loadModuleGraph = require('./load-module-graph');
var validateDependencies = require('./validate-dependencies');
var rewriteModule = require('./rewrite-module');
var composeGrammar = require('./compose-grammar');

/**
 * Takes an entry path, a loader, and a hash of options, and returns a composed
 * JSON-format Jison grammar, along with additional metadata about the individual
 * modules composing that grammar.
 */
module.exports = function loadGrammar(entryPath, loader, options) {
  var resolvedEntry = loader.resolvePath(null, entryPath);
  var modules = loadModuleGraph(resolvedEntry, loader, options);
  var exportMap = validateDependencies(modules);

  modules.forEach(function(module) {
    rewriteModule(module, exportMap);
  });

  var meta = buildMeta(modules);
  var grammar = composeGrammar(resolvedEntry, modules);

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

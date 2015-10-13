var loadModuleGraph = require('./lib/load-module-graph');
var validateDependencies = require('./lib/validate-dependencies');
var rewriteModule = require('./lib/rewrite-module');
var composeGrammar = require('./lib/compose-grammar');

module.exports = {
  Loader: require('./lib/models/loader'),
  FSLoader: require('./lib/models/fs-loader'),

  load: function(entryPath, loader, options) {
    var modules = loadModuleGraph(entryPath, loader, options);
    var exportMap = validateDependencies(modules);

    modules.forEach(function(module) {
      rewriteModule(module, exportMap);
    });

    return composeGrammar(entryPath, modules);
  }
};

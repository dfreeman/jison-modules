'use strict';

var assign = require('lodash/object/assign');
var values = require('lodash/object/values');

var Module = require('./models/module');

/**
 * Takes an entry point and a loader, loading and returning an array of all
 * modules reachable via transitive import from that entry module.
 *
 * Also accepts a hash of additional options that will be passed through to
 * the instantiated modules.
 */
module.exports = function loadModuleGraph(entryPath, loader, additionalOptions) {
  var queue = [entryPath];
  var modules = {};

  while (queue.length) {
    // Pull the front thing off the queue and load it up
    var path = queue.shift();
    var options = assign({}, loader.load(path), additionalOptions);
    var module = modules[path] = new Module(path, options);

    // Enqueue each unseen module that's imported for later processing
    module.imports.forEach(function(imp) {
      imp.canonicalize(loader, path);

      if (!modules[imp.module]) {
        queue.push(imp.module);
      }
    });
  }

  // Once the queue is empty, everything's loaded up
  return values(modules);
};

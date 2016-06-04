'use strict';

var assign = require('lodash/object/assign');
var values = require('lodash/object/values');
var map = require('lodash/collection/map');

var Promise = require('promise');
var CoreObject = require('core-object');

var Module = require('./models/module');

/**
 * Takes an entry point and a loader, loading and returning an array of all
 * modules reachable via transitive import from that entry module.
 *
 * Also accepts a hash of additional options that will be passed through to
 * the instantiated modules.
 */
module.exports = function loadModuleGraph(entryPath, loader, moduleOptions) {
  var traverser = new ModuleGraphTraverser({
    loader: loader,
    moduleOptions: moduleOptions
  });

  return traverser.load(entryPath);
};

var ModuleGraphTraverser = CoreObject.extend({
  load: function(entryPath) {
    this.pending = {};
    this.loaded = {};
    return new Promise(this.enqueueLoads.bind(this, [entryPath]));
  },

  enqueueLoads: function(paths, resolve, reject) {
    paths.forEach(function(path) {
      if (this.hasSeen(path)) return;

      this.loadStarted(path);
      this.loadModule(path).then(function(module) {
        this.loadCompleted(path, module);
        this.enqueueLoads(map(module.imports, 'module'), resolve, reject);

        if (this.isDoneLoading()) {
          resolve(values(this.loaded));
        }
      }.bind(this)).catch(reject);
    }.bind(this));
  },

  loadStarted: function(path) {
    this.pending[path] = true;
  },

  loadCompleted: function(path, module) {
    delete this.pending[path];
    this.loaded[path] = module;
  },

  hasSeen: function(path) {
    return !!(this.loaded[path] || this.pending[path]);
  },

  isDoneLoading: function() {
    return !Object.keys(this.pending).length;
  },

  loadModule: function(path) {
    return Promise.resolve(this.loader.load(path)).then(function(result) {
      var options = assign({}, result, this.moduleOptions);
      var module = new Module(path, options);
      module.imports.forEach(function(imp) {
        imp.canonicalize(this.loader, path);
      }.bind(this));
      return module;
    }.bind(this));
  }
});

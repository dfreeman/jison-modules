'use strict';

var assert = require('chai').assert;
var map = require('lodash/collection/map');
var TestLoader = require('../helpers/test-loader');

var Module = require('../../lib/models/module');
var loadModuleGraph = require('../../lib/load-module-graph');

describe('loadModuleGraph', function() {
  it('handles an entry module with no imports', function() {
    var modules = loadModuleGraph('noImports', loader);
    assert.deepEqual(map(modules, 'name'), ['noImports']);
    assert.deepEqual(map(modules, 'priority'), [Module.DEFAULT_PRIORITY]);
  });

  it('passes options through to the constructed modules', function() {
    var modules = loadModuleGraph('noImports', loader, { defaultPriority: -1 });
    assert.deepEqual(map(modules, 'name'), ['noImports']);
    assert.deepEqual(map(modules, 'priority'), [-1]);
  });

  it('loads modules referenced via import', function() {
    var modules = loadModuleGraph('entry', loader);
    assert.deepEqual(map(modules, 'name'), ['entry', 'intermediate', 'noImports']);
  });

  it('only loads referenced modules once', function() {
    var modules = loadModuleGraph('multiInclude', loader);
    assert.deepEqual(map(modules, 'name'), ['multiInclude', 'intermediate', 'entry', 'noImports']);
  });
});

var loader = new TestLoader({
  modules: {
    noImports: [
      '%%        ',
      'start: X; '
    ],

    intermediate: [
      '%import foo from "noImports" ',
      '%%                           ',
      'start: X;                    '
    ],

    entry: [
      '%import foo from "intermediate" ',
      '%%                              ',
      'start: X;                       '
    ],

    multiInclude: [
      '%import foo from "intermediate" ',
      '%import bar from "entry"        ',
      '%%                              ',
      'start: X;                       '
    ]
  }
});

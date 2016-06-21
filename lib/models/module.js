'use strict';

var flatten = require('lodash/array/flatten');

var ModuleDeclParser = require('../parsers/module-declaration');
var PrecedenceDeclParser = require('../parsers/precedence-declaration');

/**
 * Represents all known information about a Jison module, including the JSON representation
 * of its grammar and lexicon, its lexical priority and precedence rules, and its imports
 * and exports.
 */
module.exports = Module;

function Module(name, options) {
  this.name = name;
  this.grammar = options.grammar;
  this.lexicon = options.lexicon;

  this.imports = [];
  this.exports = [];
  this.precedence = [];

  if (options.grammar.operators) {
    throw new Error('Use %precedence[<assoc>, <priority>] rather than %left, %right or %unassoc');
  }

  var defaultPriority = 'defaultPriority' in options ? options.defaultPriority : Module.DEFAULT_PRIORITY;
  var grammarDecls = extractDecls(options.grammar.unknownDecls, ['import', 'export', 'precedence']);
  var lexiconDecls = extractDecls(options.lexicon && options.lexicon.unknownDecls, ['priority']);

  // Parse known module-oriented declarations
  this.priority = extractPriorityDeclaration(lexiconDecls.priority, defaultPriority, name);
  this.addImports(extractImportDeclarations(grammarDecls.import));
  this.addExports(extractExportDeclarations(grammarDecls.export));
  this.addPrecedenceDeclarations(extractPrecedenceDeclarations(grammarDecls.precedence));

  // Pass unknown declarations through as metadata
  this.grammarDecls = grammarDecls.unknown;
  this.lexiconDecls = lexiconDecls.unknown;
}

Module.DEFAULT_PRIORITY = 50;

Module.prototype.addImport = function(options) {
  this.imports.push({
    module: options.module,
    source: options.source,
    binding: options.binding,
    lexical: !!options.lexical
  });
};

Module.prototype.addExport = function(options) {
  this.exports.push({
    source: options.source,
    binding: options.binding,
    lexical: !!options.lexical
  });
};

Module.prototype.addPrecedenceDeclaration = function(options) {
  this.precedence.push({
    priority: options.priority,
    associativity: options.associativity,
    tokens: options.body.slice()
  });
};

Module.prototype.addImports = function(imports) {
  imports.forEach(this.addImport.bind(this));
};

Module.prototype.addExports = function(exports) {
  exports.forEach(this.addExport.bind(this));
};

Module.prototype.addPrecedenceDeclarations = function(exports) {
  exports.forEach(this.addPrecedenceDeclaration.bind(this));
};

function extractDecls(decls, declTypes) {
  var grouped = { unknown: [] };

  declTypes.forEach(function(declType) {
    grouped[declType] = [];
  });

  (decls || []).forEach(function(decl) {
    var type = /^%(\w+)/.exec(decl)[1];
    var group = grouped[type] || grouped.unknown;
    group.push(decl);
  });

  return grouped;
}

function extractPriorityDeclaration(priorities, defaultPriority, name) {
  if (!priorities.length) return defaultPriority;
  if (priorities.length > 1) throw new Error('Multiple priority declarations in ' + name);

  var priority = Number(priorities[0].replace(/^%priority/, '').trim());
  if (Number.isNaN(priority)) throw new Error('Invalid priority declaration ' + priority + ' in ' + name);
  return priority;
}

function extractImportDeclarations(decls) {
  return flatten(decls.map(function(decl) {
    var specifier = ModuleDeclParser.parse(decl);
    if (specifier.bindings.length === 0) {
      return { module: specifier.module };
    }

    return specifier.bindings.map(function(binding) {
      return {
        module: specifier.module,
        lexical: specifier.lexical,
        source: binding.source,
        binding: binding.binding
      };
    });
  }));
}

function extractExportDeclarations(decls) {
  return flatten(decls.map(function(decl) {
    var specifier = ModuleDeclParser.parse(decl);
    return specifier.bindings.map(function(binding) {
      return {
        lexical: specifier.lexical,
        source: binding.source,
        binding: binding.binding
      };
    });
  }));
}

function extractPrecedenceDeclarations(decls) {
  return decls.map(function(decl) {
    return PrecedenceDeclParser.parse(decl);
  });
}

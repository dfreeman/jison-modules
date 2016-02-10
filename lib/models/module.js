'use strict';

var flatten = require('lodash/array/flatten');

var ModuleDeclParser = require('../parsers/module-declaration');
var PrecedenceDeclParser = require('../parsers/precedence-declaration');

module.exports = function Module(name, options) {
  this.name = name;
  this.grammar = options.grammar;
  this.lexicon = options.lexicon;

  if (options.grammar.operators) {
    throw new Error('Use %precedence[<assoc>, <priority>] rather than %left, %right or %unassoc');
  }

  var defaultPriority = 'defaultPriority' in options ? options.defaultPriority : DEFAULT_PRIORITY;
  var grammarDecls = extractDecls(options.grammar.unknownDecls, ['import', 'export', 'precedence']);
  var lexiconDecls = extractDecls(options.lexicon && options.lexicon.unknownDecls, ['priority']);

  // Parse known module-oriented declarations
  this.priority = extractPriorityDeclaration(lexiconDecls.priority, defaultPriority, name);
  this.imports = extractModuleDeclarations(grammarDecls.import, ImportBinding);
  this.exports = extractModuleDeclarations(grammarDecls.export, ExportBinding);
  this.precedence = extractPrecedenceDeclarations(grammarDecls.precedence);

  // Pass unknown declarations through as metadata
  this.grammarDecls = grammarDecls.unknown;
  this.lexiconDecls = lexiconDecls.unknown;
};

var DEFAULT_PRIORITY = module.exports.DEFAULT_PRIORITY = 50;

function ExportBinding(exportStatement, parsedBinding) {
  this.source = parsedBinding.source;
  this.binding = parsedBinding.binding;
  this.lexical = !!exportStatement.lexical;
}

function ImportBinding(importStatement, parsedBinding) {
  this.module = importStatement.module;
  this.source = parsedBinding.source;
  this.binding = parsedBinding.binding;
  this.lexical = !!importStatement.lexical;
}

ImportBinding.prototype.canonicalize = function(loader, basePath) {
  this.module = loader.resolvePath(basePath, this.module);
};

function PrecedenceDeclaration(parsedDecl) {
  this.priority = parsedDecl.priority;
  this.associativity = parsedDecl.associativity;
  this.tokens = parsedDecl.body.slice();
}

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
  return Number.isNaN(priority) ? defaultPriority : priority;
}

function extractModuleDeclarations(decls, Binding) {
  return flatten(decls.map(function(decl) {
    var specifier = ModuleDeclParser.parse(decl);
    return specifier.bindings.map(function(binding) {
      return new Binding(specifier, binding);
    });
  }));
}

function extractPrecedenceDeclarations(decls) {
  return decls.map(function(decl) {
    return new PrecedenceDeclaration(PrecedenceDeclParser.parse(decl));
  });
}

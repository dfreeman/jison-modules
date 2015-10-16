'use strict';

var flatten = require('lodash/array/flatten');

var ModuleDeclParser = require('../parsers/module-declaration');
var OpDeclParser = require('../parsers/op-declaration');

module.exports = function Module(name, options) {
  this.name = name;
  this.grammar = options.grammar;
  this.lexicon = options.lexicon;

  if (options.grammar.operators) {
    throw new Error('Use %op[<assoc>, <prec>] rather than %left, %right or %unassoc');
  }

  var defaultPriority = 'defaultPriority' in options ? options.defaultPriority : DEFAULT_PRIORITY;
  var decls = extractDecls(options.grammar.unknownDecls || []);

  // Parse known module-oriented declarations
  this.priority = extractPriorityDeclaration(decls.priority, defaultPriority, name);
  this.imports = extractModuleDeclarations(decls.import, ImportBinding);
  this.exports = extractModuleDeclarations(decls.export, ExportBinding);
  this.operators = extractOperatorDeclarations(decls.op);

  // Pass unknown declarations through as metadata
  this.grammarDecls = decls.unknown;
  this.lexiconDecls = options.lexicon && options.lexicon.unknownDecls || [];
};

var DEFAULT_PRIORITY = 50;

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

function Operator(parsedOperator) {
  this.precedence = parsedOperator.precedence;
  this.associativity = parsedOperator.associativity;
  this.tokens = parsedOperator.body.slice();
}

var declTypes = ['import', 'export', 'op', 'priority'];
function extractDecls(decls) {
  var grouped = { unknown: [] };

  declTypes.forEach(function(declType) {
    grouped[declType] = [];
  });

  decls.forEach(function(decl) {
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

function extractOperatorDeclarations(decls) {
  return decls.map(function(decl) {
    return new Operator(OpDeclParser.parse(decl));
  });
}

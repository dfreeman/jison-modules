var CoreObject = require('core-object');
var flatten = require('lodash/array/flatten');

var ModuleDeclParser = require('../parsers/module-declaration');
var OpDeclParser = require('../parsers/op-declaration');

module.exports = CoreObject.extend({
  init: function(name, options) {
    this.name = name;
    this.grammar = options.grammar;
    this.lexicon = options.lexicon;

    if (options.grammar.operators) {
      throw new Error('Use %op[<assoc>, <prec>] rather than %left, %right or %unassoc');
    }

    var decls = options.grammar.unknownDecls || [];
    var defaultPriority = 'defaultPriority' in options ? options.defaultPriority : DEFAULT_PRIORITY;

    this.priority = extractPriority(decls, defaultPriority, name);
    this.imports = extractImports(decls);
    this.exports = extractExports(decls);
    this.operators = extractOperators(decls);
  }
});

var DEFAULT_PRIORITY = 50;

var ExportBinding = CoreObject.extend({
  init: function(exportStatement, parsedBinding) {
    this.source = parsedBinding.source;
    this.binding = parsedBinding.binding;
    this.lexical = !!exportStatement.lexical;
  }
});

var ImportBinding = CoreObject.extend({
  init: function(importStatement, parsedBinding) {
    this.module = importStatement.module;
    this.source = parsedBinding.source;
    this.binding = parsedBinding.binding;
    this.lexical = !!importStatement.lexical;
  },

  canonicalize: function(loader, basePath) {
    this.module = loader.resolvePath(basePath, this.module);
  }
});

var Operator = CoreObject.extend({
  init: function(parsedOperator) {
    this.precedence = parsedOperator.precedence;
    this.associativity = parsedOperator.associativity;
    this.tokens = parsedOperator.body.slice();
  }
});

function extractPriority(decls, defaultPriority, name) {
  var priorities = decls.filter(function(decl) { return /^%priority/.test(decl); });
  if (!priorities.length) { return defaultPriority; }
  if (priorities.length > 1) { throw new Error('Multiple priority declarations in ' + name); }

  var priority = Number(priorities[0].replace(/^%priority/, '').trim());
  return Number.isNaN(priority) ? defaultPriority : priority;
}

function extractImports(decls) {
  var imports = parseDeclarations(decls, /^%import/, ModuleDeclParser);

  return flatten(imports.map(function(imp) {
    return imp.bindings.map(function(binding) {
      return new ImportBinding(imp, binding);
    });
  }));
}

function extractExports(decls) {
  var exports = parseDeclarations(decls, /^%export/, ModuleDeclParser);

  return flatten(exports.map(function(exp) {
    return exp.bindings.map(function(binding) {
      return new ExportBinding(exp, binding);
    });
  }));
}

function extractOperators(decls) {
  var operators = parseDeclarations(decls, /^%op/, OpDeclParser);

  return operators.map(function(operator) {
    return new Operator(operator);
  });
}

function parseDeclarations(decls, pattern, parser) {
  return decls
    .filter(function(decl) { return pattern.test(decl) })
    .map(function(decl) { return parser.parse(decl); });
}
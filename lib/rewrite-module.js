'use strict';

var transform = require('lodash/object/transform');

var prefixify = require('./utils/prefixify');
var prefixAction = require('./utils/prefix-action');

/**
 * Given a module and a map of all available exported bindings, rewrites
 * the rules in that module, performing two tasks:
 *  - imported bindings are rewritten to match the global exported name of
 *    those bindings based on their source module
 *  - all other identifiers are munged to reflect their existence within
 *    this particular module
 * Note that this function assumes all imports and exports already passed
 * validating sanity checks.
 */
module.exports = function rewriteModule(module, exportMap) {
  var prefix = prefixify(module.name);
  var importMapping = buildImportMapping(module.imports, exportMap);

  namespaceLexicon(prefix, module.lexicon);
  namespacePrecedence(prefix, importMapping, module.precedence);
  namespaceGrammar(prefix, importMapping, module.grammar);
};

// Prefix token tags, macro names, and state names in the given lexicon
function namespaceLexicon(prefix, lexicon) {
  if (!lexicon) return;

  var macroRegex = new RegExp('\\{(' + Object.keys(lexicon.macros || {}).join('|') + ')\\}', 'g');
  var macroReplacement = '{' + prefix.replace(/\$/g, '$$$$') + '$1}';

  lexicon.rules.forEach(function(rule) {
    var index = 0;
    if (Array.isArray(rule[0])) {
      index = 1;
      rule[0] = rule[0].map(function(state) {
        return prefix + state;
      });
    }

    rule[index] = rule[index].replace(macroRegex, macroReplacement);

    // FIXME this is pretty brittle, and the overhead of the function calls isn't great either
    rule[index + 1] = 'return ' + prefixAction.functionName + '(this, "' + prefix + '", function() {\n' + rule[index + 1] + '\n});';
  });

  lexicon.macros = transform(lexicon.macros, function(macros, value, key) {
    macros[prefix + key] = value.replace(macroRegex, macroReplacement);
  });

  lexicon.startConditions = transform(lexicon.startConditions, function(conditions, value, key) {
    conditions[prefix + key] = value;
  });
}

// Prefix all rule declarations and bodies in the given grammar
function namespaceGrammar(prefix, mapping, grammar) {
  var originals = grammar.bnf;
  var rules = grammar.bnf = {};

  Object.keys(originals).forEach(function(originalName) {
    var originalRule = originals[originalName];
    rules[prefix + originalName] = originalRule.map(function(alternative) {
      return namespaceRule(prefix, mapping, alternative);
    });
  });

  if (grammar.start) {
    grammar.start = prefixIdentifier(grammar.start, prefix, mapping);
  }
}

// Prefix the referenced token tags in precedence declarations
function namespacePrecedence(prefix, importMapping, precedence) {
  precedence.forEach(function(decl) {
    for (var i = 0, len = decl.tokens.length; i < len; i++) {
      decl.tokens[i] = prefixIdentifier(decl.tokens[i], prefix, importMapping);
    }
  });
}

function namespaceRule(prefix, mapping, alternative) {
  var namespaced = alternative;
  if (Array.isArray(namespaced)) {
    namespaced = namespaced.slice();
    namespaced[0] = prefixSequence(namespaced[0], prefix, mapping);

    var decls = namespaced[namespaced.length - 1];
    if (decls.prec) {
      decls.prec = prefixIdentifier(decls.prec, prefix, mapping);
    }
  } else {
    namespaced = prefixSequence(alternative, prefix, mapping);
  }
  return namespaced;
}

function prefixSequence(sequence, prefix, mapping) {
  if (!sequence) return sequence;
  return sequence.split(' ').map(function(id) {
    return prefixIdentifier(id, prefix, mapping);
  }).join(' ');
}

function prefixIdentifier(identifier, prefix, mapping) {
  return mapping[identifier] || prefix + identifier;
}

function buildImportMapping(imports, exportMap) {
  var mapping = {};
  imports.forEach(function(imp) {
    if (!imp.binding) return;
    mapping[imp.binding] = prefixify(imp.module) + exportMap[imp.module][imp.source].source;
  });
  return mapping;
}

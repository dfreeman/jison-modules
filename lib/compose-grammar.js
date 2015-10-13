var sortBy = require('lodash/collection/sortBy');
var sortByAll = require('lodash/collection/sortByAll');
var map = require('lodash/collection/map');
var find = require('lodash/collection/find');
var flatten = require('lodash/array/flatten');
var compact = require('lodash/array/compact');
var assign = require('lodash/object/assign');

var prefixAction = require('./utils/prefix-action');

/**
 * Given the name of the entry module and an array of prepared modules,
 * recomposes those modules into a single unified grammar.
 */
module.exports = function composeGrammar(entryPoint, modules) {
  var orderedModules = sortBy(modules, 'priority');

  var grammar = buildGrammar(orderedModules);
  grammar.lex = buildLexicon(orderedModules);
  grammar.start = findStartRule(entryPoint, modules);
  return grammar;
};

function buildLexicon(modules) {
  var lexicons = compact(map(modules, 'lexicon'));
  var actions = compact(map(lexicons, 'actionInclude')).join('\n');
  var rules = compact(flatten(map(lexicons, 'rules')));
  var macros = assign.apply(null, [{}].concat(map(lexicons, 'macros')));
  var conditions = assign.apply(null, [{}].concat(compact(map(lexicons, 'startConditions'))));

  return {
    actionInclude: prefixAction.functionDefinition + '\n' + actions,
    macros: macros,
    startConditions: conditions,
    rules: rules
  };
}

function buildGrammar(modules) {
  var grammars = map(modules, 'grammar');
  var rules = assign.apply(null, [{}].concat(map(grammars, 'bnf')));
  var operators = transformOperators(compact(flatten(map(modules, 'operators'))));

  return {
    bnf: rules,
    operators: operators
  };
}

function transformOperators(operators) {
  var sorted = sortByAll(operators, ['precedence', 'associativity']);

  var operators = [];
  var current = [sorted[0].associativity];
  current.precedence = sorted[0].precedence;

  sorted.forEach(function(op) {
    if (op.precedence === current.precedence) {
      current.push.apply(current, op.tokens);
    } else {
      operators.unshift(current);
      current = [op.associativity].concat(op.tokens);
      current.precedence = op.precedence;
    }
  });

  operators.unshift(current);

  return operators;
}

// TODO verify this is correct
function findStartRule(entryPoint, modules) {
  var module = find(modules, 'name', entryPoint);
  return module.grammar.start || Object.keys(module.grammar.rules)[0];
}

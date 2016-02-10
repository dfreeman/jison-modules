'use strict';

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
  var actionIncludes = compact(map(lexicons, 'actionInclude'));
  var rules = compact(flatten(map(lexicons, 'rules')));
  var macros = assign.apply(null, [{}].concat(map(lexicons, 'macros')));
  var conditions = assign.apply(null, [{}].concat(compact(map(lexicons, 'startConditions'))));

  actionIncludes.unshift(prefixAction.functionDefinition);

  return {
    actionInclude: actionIncludes.join('\n'),
    macros: macros,
    startConditions: conditions,
    rules: rules
  };
}

function buildGrammar(modules) {
  var grammars = map(modules, 'grammar');
  var rules = assign.apply(null, [{}].concat(map(grammars, 'bnf')));
  var operators = transformPrecedence(compact(flatten(map(modules, 'precedence'))));
  var moduleIncludes = compact(map(grammars, 'moduleInclude'));

  return {
    bnf: rules,
    operators: operators,
    moduleInclude: moduleIncludes.join('\n')
  };
}

function transformPrecedence(precedence) {
  var sorted = sortByAll(precedence, ['priority', 'associativity']);
  if (!sorted.length) return [];

  var result = [];
  var current = [sorted[0].associativity];
  current.priority = sorted[0].priority;

  sorted.forEach(function(op) {
    if (op.priority === current.priority && op.associativity === current[0]) {
      current.push.apply(current, op.tokens);
    } else {
      delete current.priority;
      result.push(current);
      current = [op.associativity].concat(op.tokens);
      current.priority = op.priority;
    }
  });

  delete current.priority;
  result.push(current);

  return result;
}

// TODO verify this is correct
function findStartRule(entryPoint, modules) {
  var module = find(modules, 'name', entryPoint);
  return module.grammar.start || Object.keys(module.grammar.bnf)[0];
}

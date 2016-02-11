'use strict';

/**
 * A simple test helper to produce a minimal module object
 */
module.exports = function testModule(name, options) {
  var result = { name: name };
  result.grammar = options.grammar || {};
  result.grammar.bnf = result.grammar.bnf || {};
  result.lexicon = options.lexicon || {};
  result.lexicon.rules = result.lexicon.rules || [];
  result.priority = options.priority;
  result.precedence = options.precedence || [];
  result.imports = options.imports || [];
  result.exports = options.exports || [];
  return result;
};

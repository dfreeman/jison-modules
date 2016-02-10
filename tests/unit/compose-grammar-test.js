'use strict';

var assert = require('chai').assert;
var prefixAction = require('../../lib/utils/prefix-action');
var composeGrammar = require('../../lib/compose-grammar');

describe('composeGrammar', function() {
  it('concatenates moduleIncludes from its constituent grammars', function() {
    var result = composeGrammar('a', [
      testModule('a', 20, { grammar: { moduleInclude: 'var a = true;' } }),
      testModule('b', 10, { grammar: { moduleInclude: 'var b = true;' } }),
      testModule('c', 30, { grammar: { moduleInclude: 'var c = true;' } })
    ]);

    assert.equal(result.moduleInclude, [
      'var b = true;',
      'var a = true;',
      'var c = true;'
    ].join('\n'));
  });

  it('concatenates actionIncludes from its constituent lexicons', function() {
    var result = composeGrammar('a', [
      testModule('a', 20, { lexicon: { actionInclude: 'var a = true;' } }),
      testModule('b', 10, { lexicon: { actionInclude: 'var b = true;' } }),
      testModule('c', 30, { lexicon: { actionInclude: 'var c = true;' } })
    ]);

    assert.equal(result.lex.actionInclude, [
      prefixAction.functionDefinition,
      'var b = true;',
      'var a = true;',
      'var c = true;'
    ].join('\n'));
  });

  it('pulls macros from all constituent lexicons', function() {
    var result = composeGrammar('a', [
      testModule('a', 10, { lexicon: { macros: { foo: 'bar' } } }),
      testModule('b', 20, { lexicon: { macros: { baz: 'qux', fizz: 'buzz' } } }),
      testModule('c', 30, {})
    ]);

    assert.deepEqual(result.lex.macros, {
      foo: 'bar',
      baz: 'qux',
      fizz: 'buzz'
    });
  });

  it('pulls start conditions from all constituent lexicons', function() {
    var result = composeGrammar('a', [
      testModule('a', 10, { lexicon: { startConditions: { foo: 'bar' } } }),
      testModule('b', 20, { lexicon: { startConditions: { baz: 'qux', fizz: 'buzz' } } }),
      testModule('c', 30, {})
    ]);

    assert.deepEqual(result.lex.startConditions, {
      foo: 'bar',
      baz: 'qux',
      fizz: 'buzz'
    });
  });

  it('concatenates rules from all constituent lexicons', function() {
    var result = composeGrammar('a', [
      testModule('a', 20, { lexicon: { rules: ['a1', 'a2'] } }),
      testModule('b', 10, { lexicon: { rules: ['b1'] } }),
      testModule('c', 30, { lexicon: { rules: ['c1', 'c2', 'c3'] } })
    ]);

    assert.deepEqual(result.lex.rules, ['b1', 'a1', 'a2', 'c1', 'c2', 'c3']);
  });

  it('combines rules from all constituent grammars', function() {
    var result = composeGrammar('a', [
      testModule('a', 10, { grammar: { bnf: { foo: 'bar' } } }),
      testModule('b', 20, { grammar: { bnf: { baz: 'qux', fizz: 'buzz' } } }),
      testModule('c', 30, { grammar: { bnf: { other: 'thing' } } })
    ]);

    assert.deepEqual(result.bnf, {
      foo: 'bar',
      baz: 'qux',
      fizz: 'buzz',
      other: 'thing'
    });
  });

  it('extracts and orders operators by priority', function() {
    var result = composeGrammar('a', [
      testModule('a', 20, { precedence: [prec('left', 3, ['l3a', 'l3b']), prec('left', 2, ['l2'])] }),
      testModule('b', 10, { precedence: [prec('left', 3, ['l3c']), prec('right', 2, ['r2'])] }),
      testModule('c', 30, { precedence: [prec('right', 1, ['r1']), prec('left', 4, ['l4'])] })
    ]);

    assert.deepEqual(result.operators, [
      ['right', 'r1'],
      ['left', 'l2'],
      ['right', 'r2'],
      ['left', 'l3c', 'l3a', 'l3b'],
      ['left', 'l4']
    ]);
  });

  it('determines the start rule from the entry point\'s first rule by default', function() {
    var result = composeGrammar('b', [
      testModule('a', 10, { grammar: { bnf: { a1: 'a' } } }),
      testModule('b', 20, { grammar: { bnf: { b1: 'b1', b2: 'b2' } } })
    ]);

    assert.equal(result.start, 'b1');
  });

  it('determines the start rule from the entry point\'s explicit start rule when specified', function() {
    var result = composeGrammar('b', [
      testModule('a', 10, { grammar: { bnf: { a1: 'a' } } }),
      testModule('b', 20, { grammar: { bnf: { b1: 'b1', b2: 'b2' }, start: 'b2' } })
    ]);

    assert.equal(result.start, 'b2');
  });
});

function testModule(name, priority, options) {
  var grammar = options.grammar || {};
  grammar.bnf = grammar.bnf || {};

  return {
    name: name,
    priority: priority,
    grammar: grammar,
    lexicon: options.lexicon,
    precedence: options.precedence
  };
}

function prec(associativity, priority, tokens) {
  return { associativity: associativity, priority: priority, tokens: tokens };
}

'use strict';

var assert = require('chai').assert;

module.exports = {
  description: 'a configured `preprocess` function is applied',

  options: {
    preprocess: function(modules) {
      assert.equal(modules.length, 1);
      assert.deepEqual(modules[0].grammar.bnf.start, ['']);

      var bnf = modules[0].grammar.bnf;
      bnf.start = ['items'];
      bnf.items = ['item items', ''];
      bnf.item = ['foo', 'bar'];
    }
  },

  parseResult: true
};

'use strict';

module.exports = {
  description: 'grammars with no imports pass through',

  meta: {
    modules: {
      entry: {
        exports: [],
        prefix: 'entry__',
        grammarDecls: ['%buzz'],
        lexiconDecls: ['%fizzle']
      }
    }
  },

  parseResult: ['foo', 'bar', 'foo', 'foo']
};

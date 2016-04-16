'use strict';

module.exports = {
  description: 'bindingless imports work',

  meta: {
    modules: {
      entry: {
        exports: [],
        prefix: 'entry__',
        grammarDecls: [],
        lexiconDecls: []
      },
      skipWhitespace: {
        exports: [],
        prefix: 'skipWhitespace__',
        grammarDecls: [],
        lexiconDecls: []
      }
    }
  },

  parseResult: true
};

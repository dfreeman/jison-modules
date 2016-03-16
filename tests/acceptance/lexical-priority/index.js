'use strict';

module.exports = {
  description: 'lexicon rules are ordered according to priority',
  parseResult: [
    'foo2',
    'foo3',
    'foo4', 'foo2',
    'foo1',
    'foo4', 'foo3'
  ]
};

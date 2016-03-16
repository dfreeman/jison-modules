'use strict';

var functionName = 'jisonModules_prefix';
var functionDefinition = 'var ' + functionName + ' = ' + makePrefixer() + ';';

module.exports = {
  functionName: functionName,
  functionDefinition: functionDefinition
};

function makePrefixer() {
  return [
    '  function prefixer(context, prefix, fn) {',
    '    var begin = context.begin;',
    '    context.begin = function(state) {',
    '      return begin.call(this, prefix + state);',
    '    };',
    '    try {',
    '      var value = fn.call(context);',
    '      return value && (prefix + value);',
    '    } finally {',
    '      context.begin = begin;',
    '    }',
    '  }'
  ].join('\n');
}

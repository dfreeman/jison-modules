var flatten = require('lodash/array/flatten');
var transform = require('lodash/object/transform');

/**
 * Takes a hash of modules keyed by their name and validates that all imports
 * and exports in those modules refer to valid rules.
 *
 * If not, raises an exception describing where the problems are.
 */
module.exports = function validateDependencies(modules) {
  var exportMap = buildExportMap(modules);

  var errors = flatten(modules.map(function(module) {
    return validateImports(module, exportMap).concat(validateExports(module));
  }));

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  return exportMap;
}

function validateImports(module, exportMap) {
  return module.imports
    .filter(function(imp) {
      return !(imp.source in exportMap[imp.module]);
    })
    .map(function(imp) {
      var problem = imp.source === 'default' ? 'default export' : 'rule named "' + imp.source + '"';
      return 'Module ' + imp.module + ' has no ' + problem + ' ' + '(attempted import from ' + module.name + ')';
    });
}

function validateExports(module) {
  return module.exports
    .filter(function(exp) {
      // Lex exports won't have a corresponding rule
      return !exp.lexical && !module.grammar.bnf[exp.source];
    })
    .map(function(exp) {
      return 'Module ' + module.name + ' has no rule "' + exp.source + '" to export';
    });
}

function buildExportMap(modules) {
  return transform(modules, function(exports, module) {
    exports[module.name] = transform(module.exports, function(acc, exp) {
      acc[exp.binding] = exp.source;
    }, {});
  }, {});
}

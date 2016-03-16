'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;

var Jison = require('jison');
var JisonModules = require('..');

describe('Acceptance tests', function() {
  this.slow(200);

  fs.readdirSync(path.join(__dirname, 'acceptance')).forEach(function(test) {
    var expectation = require('./acceptance/' + test);

    it(expectation.description, function() {
      if (expectation.loadError) {
        assert.throws(function() {
          loadTestGrammar(test, expectation);
        }, expectation.loadError);
        return;
      }

      var loaded = loadTestGrammar(test, expectation);
      if (expectation.meta) {
        assert.deepEqual(loaded.meta, expectation.meta);
      }

      if (expectation.parseResult) {
        assert.deepEqual(parseTestInput(test, loaded.grammar), expectation.parseResult);
      } else if (expectation.parseError) {
        assert.throws(function() {
          parseTestInput(test, loaded.grammar);
        }, expectation.parseError);
      }
    });
  });
});

function parseTestInput(test, grammar) {
  var inputFile = path.join(__dirname, 'acceptance', test, 'input');
  var parser = new Jison.Generator(grammar).createParser();
  return parser.parse(fs.readFileSync(inputFile, 'utf-8'));
}

function loadTestGrammar(test, expectation) {
  var baseDirectory = path.join(__dirname, 'acceptance', test);
  var loader = new JisonModules.FSLoader({ baseDirectory: baseDirectory });
  return JisonModules.load('entry', loader, expectation.options);
}

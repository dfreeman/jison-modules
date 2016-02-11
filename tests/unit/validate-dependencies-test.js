'use strict';

var assert = require('chai').assert;
var testModule = require('../helpers/test-module');

var validateDependencies = require('../../lib/validate-dependencies');

describe('validateDependencies', function() {
  it('rejects invalid rule exports', function() {
    var mod = testModule('test', {
      exports: [{ binding: 'public', source: 'internal' }]
    });

    assert.throws(function() {
      validateDependencies([mod]);
    }, 'Module test has no rule "internal" to export');
  });

  it('maps valid rule exports', function() {
    var mod = testModule('test', {
      grammar: { bnf: { internal: {} } },
      exports: [{ binding: 'public', source: 'internal' }]
    });

    assert.deepEqual(validateDependencies([mod]), {
      test: {
        public: { binding: 'public', source: 'internal' }
      }
    });
  });

  it('maps exported lexical tokens', function() {
    var mod = testModule('test', {
      exports: [{ binding: 'public', source: 'internal', lexical: true }]
    });

    assert.deepEqual(validateDependencies([mod]), {
      test: {
        public: { binding: 'public', source: 'internal', lexical: true }
      }
    });
  });

  it('rejects mismatched lexical and grammatical import/export pairs', function() {
    var sourceMod = testModule('source', {
      grammar: {
        bnf: { bar: [] }
      },
      exports: [
        { source: 'foo', binding: 'foo', lexical: true },
        { source: 'bar', binding: 'bar' }
      ]
    });

    var destMod = testModule('dest', {
      imports: [
        { module: 'source', source: 'foo', binding: 'foo' },
        { module: 'source', source: 'bar', binding: 'bar', lexical: true }
      ]
    });

    assert.throws(function() {
      validateDependencies([sourceMod, destMod]);
    }, /no exported rule named "foo".*\n.*no exported lexical token named "bar"/);
  });

  it('rejects invalid lexical imports', function() {
    var sourceMod = testModule('source', {});
    var destMod = testModule('dest', {
      imports: [{ module: 'source', source: 'foo', binding: 'foo', lexical: true }]
    });

    assert.throws(function() {
      validateDependencies([sourceMod, destMod]);
    }, 'Module source has no exported lexical token named "foo" (attempted import from dest)');
  });

  it('rejects invalid named rule imports', function() {
    var sourceMod = testModule('source', {});
    var destMod = testModule('dest', {
      imports: [{ module: 'source', source: 'foo', binding: 'foo'}]
    });

    assert.throws(function() {
      validateDependencies([sourceMod, destMod]);
    }, 'Module source has no exported rule named "foo" (attempted import from dest)');
  });

  it('rejects invalid default rule imports', function() {
    var sourceMod = testModule('source', {});
    var destMod = testModule('dest', {
      imports: [{ module: 'source', source: 'default', binding: 'foo' }]
    });

    assert.throws(function() {
      validateDependencies([sourceMod, destMod]);
    }, 'Module source has no default export (attempted import from dest)');
  });
});

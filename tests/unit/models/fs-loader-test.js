'use strict';

var path = require('path');
var assert = require('chai').assert;
var mockFS = require('mock-fs');

var FSLoader = require('../../../lib/models/fs-loader');

describe('FSLoader', function() {
  afterEach(function() {
    mockFS.restore();
  });

  it('honors the configured grammarExtension and lexiconExtension', function() {
    mockFS({
      '/foo.gram': 'grammar content',
      '/foo.lexi': 'lexicon content'
    });

    var loader = new FSLoader({ grammarExtension: 'gram', lexiconExtension: 'lexi' });

    assert.equal(loader.readGrammar('/foo'), 'grammar content');
    assert.equal(loader.readLexicon('/foo'), 'lexicon content');
  });

  it('returns null for nonexistent files', function() {
    mockFS();

    var loader = new FSLoader();

    assert.equal(loader.readGrammar('foo'), null);
    assert.equal(loader.readLexicon('foo'), null);
  });

  it('resolves relative paths relative to the given importing file', function() {
    mockFS({
      'shallowfile.y': 'shallow grammar',
      dir: {
        'midfile.y': 'mid grammar',
        subdir: {
          'deepfile.y': 'deep grammar'
        }
      }
    });

    var loader = new FSLoader();

    assert.equal(loader.resolvePath(null, 'shallowfile.y'), 'shallowfile.y');
    assert.equal(loader.resolvePath('/shallowfile.y', './dir/midfile.y'), '/dir/midfile.y');
    assert.equal(loader.resolvePath('/dir/midfile.y', './subdir/deepfile.y'), '/dir/subdir/deepfile.y');
    assert.equal(loader.resolvePath('/dir/subdir/deepfile.y', '../../shallowfile.y'), '/shallowfile.y');
    assert.equal(loader.resolvePath('/dir/midfile.y', '/shallowfile.y'), '/shallowfile.y');
  });

  it('honors the configured baseDirectory if present', function() {
    mockFS({
      '/shallowfile.y': 'shallow grammar',
      '/dir': {
        'midfile.y': 'mid grammar',
        subdir: {
          'deepfile.y': 'deep grammar'
        }
      }
    });

    var loader = new FSLoader({ baseDirectory: '/dir' });

    assert.equal(read(loader, { path: '../shallowfile', from: '/dir/midfile.y' }), 'shallow grammar');
    assert.equal(read(loader, { path: 'subdir/deepfile', from: '/dir/midfile.y' }), 'deep grammar');
    assert.equal(read(loader, { path: '../../shallowfile', from: '/dir/subdir/deepfile.y' }), 'shallow grammar');
    assert.equal(read(loader, { path: '/shallowfile', from: '/dir/midfile.y' }), 'shallow grammar');
    assert.equal(read(loader, { path: 'midfile', from : '/shallowfile.y' }), 'mid grammar');
    assert.equal(read(loader, { path: 'midfile', from : '/dir/subdir/deepfile.y' }), 'mid grammar');
    assert.equal(read(loader, { path: 'subdir/deepfile', from: '/dir/midfile.y' }), 'deep grammar');
  });

  it('uses the current working directory as the base directory if not otherwise specified', function() {
    var files = { '/root.y': 'root grammar' };
    files[path.join(process.cwd(), 'cwd.y')] = 'cwd grammar';
    mockFS(files);

    var loader = new FSLoader();

    assert.equal(read(loader, { path: 'cwd', from: '/root.y' }), 'cwd grammar');
  });
});

function read(loader, options) {
  return loader.readGrammar(loader.resolvePath(options.from, options.path));
}

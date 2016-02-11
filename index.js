'use strict';

module.exports = {
  Loader: require('./lib/models/loader'),
  FSLoader: require('./lib/models/fs-loader'),

  load: require('./lib/load-grammar')
};

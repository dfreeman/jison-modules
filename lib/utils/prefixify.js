// Transform the given path into a suitable prefix for a production/token identifier
module.exports = function prefixify(path) {
  return memoized[path] || (memoized[path] = path.replace(/\W/g, '$') + '__');
};

var memoized = Object.create(null);

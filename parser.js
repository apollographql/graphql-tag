var parser = require('./bundledParser');

Object.keys(parser).forEach(function(exportName) {
  exports[exportName] = function() {
    console.warn(
      "Warning - the `parser` exports from `graphql-tag` will be removed in the next major version." +
      "\nSee https://github.com/apollographql/graphql-tag/issues/54 for more information."
    );

    return parser[exportName].apply(undefined, arguments);
  }
});

var parser = require('./bundledParser');

console.warn(
  "Warning - the `parser` exports from `graphql-tag` will be removed in the next major version." +
  "\nSee https://github.com/apollographql/graphql-tag/issues/54 for more information."
);

module.exports = parser;


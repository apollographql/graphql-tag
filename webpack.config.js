var webpack = require('webpack');

module.exports = [
  {
    entry: {
      parser: ['./node_modules/graphql/language/parser'],
    },
    output: {
      library: 'gql',
      libraryTarget: 'commonjs2',
      filename: '[name].js'
    },
  },
  {
    entry: {
      printer: ['./node_modules/graphql/language/printer'],
    },
    output: {
      library: 'gql',
      libraryTarget: 'commonjs2',
      filename: '[name].js'
    },
  }
];

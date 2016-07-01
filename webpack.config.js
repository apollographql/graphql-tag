var webpack = require('webpack');

module.exports = {
  entry: {
    parser: ['./node_modules/graphql/language/parser']
  },
  output: {
    library: 'parser',
    libraryTarget: 'commonjs2',
    filename: 'parser.js'
  },
};

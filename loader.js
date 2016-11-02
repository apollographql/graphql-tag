const gql = require('./');

module.exports = function(source) {
  this.cacheable();
  return `module.exports = ${JSON.stringify(gql`${source}`)};`;
};

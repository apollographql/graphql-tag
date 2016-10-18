const gql = require('./');

module.exports = source => `module.exports = ${JSON.stringify(gql`${source}`)};`;

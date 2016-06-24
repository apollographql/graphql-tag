var gql = require('./index');
var assert = require('chai').assert;

describe('gql', () => {
  it('parses queries', () => {
    assert.equal(gql`{ testQuery }`.kind, 'Document');
  });

  it('returns the same object for the same query', () => {
    assert.isTrue(gql`{ sameQuery }` === gql`{ sameQuery }`);
  });
});

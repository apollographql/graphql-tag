var gql = require('./index');
var assert = require('chai').assert;

describe('gql', function () {
  it('parses queries', function () {
    assert.equal(gql`{ testQuery }`.kind, 'Document');
  });

  it('returns the same object for the same query', function () {
    assert.isTrue(gql`{ sameQuery }` === gql`{ sameQuery }`);
  });
});

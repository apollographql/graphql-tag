var gqlRequire = require('./index');
var gqlDefault = require('./index').default;
import { assert } from 'chai';

[gqlRequire, gqlDefault].forEach((gql, i) => {
  describe(`gql ${i}`, () => {
    it('parses queries', () => {
      assert.equal(gql`{ testQuery }`.kind, 'Document');
    });

    it('returns the same object for the same query', () => {
      assert.isTrue(gql`{ sameQuery }` === gql`{ sameQuery }`);
    });
  });
});

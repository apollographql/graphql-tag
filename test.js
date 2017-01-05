const gqlRequire = require('./');
const gqlDefault = require('./').default;
const loader = require('./loader');
const assert = require('chai').assert;

[gqlRequire, gqlDefault].forEach((gql, i) => {
  describe(`gql ${i}`, () => {
    it('parses queries', () => {
      assert.equal(gql`{ testQuery }`.kind, 'Document');
    });

    it('parses queries with weird substitutions', () => {
      const obj = {};
      assert.equal(gql`{ field(input: "${obj.missing}") }`.kind, 'Document');
      assert.equal(gql`{ field(input: "${null}") }`.kind, 'Document');
      assert.equal(gql`{ field(input: "${0}") }`.kind, 'Document');
    });

    it('parses queries through webpack loader', () => {
      const jsSource = loader.call({ cacheable() {} }, '{ testQuery }');
      const module = { exports: undefined };
      eval(jsSource);
      assert.equal(module.exports.kind, 'Document');
    });

    it('correctly imports other files through the webpack loader', () => {
      const query = `#import "./fragment_definition.graphql"
        query {
          author {
            ...authorDetails
          }
        }`;
      const jsSource = loader.call({ cacheable() {} }, query);
      const oldRequire = require;
      const module = { exports: undefined };
      const require = (path) => {
        assert.equal(path, './fragment_definition.graphql');
        return loader.call(
          { cacheable() {} },
          `
          fragment authorDetails on Author {
            firstName
            lastName
          }`,
        );
      };
      eval(jsSource);
      assert.equal(module.exports.kind, 'Document');
      assert.equal(module.exports.definitions.length, 2);
    });

    it('does not complain when presented with normal comments', (done) => {
      assert.doesNotThrow(() => {
        const query = `#normal comment
          query {
            author {
              ...authorDetails
            }
          }`;
        const jsSource = loader.call({ cacheable() {} }, query);
        const module = { exports: undefined };
        eval(jsSource);
        assert.equal(module.exports.kind, 'Document');
        done();
      });
    });
    
    it('returns the same object for the same query', () => {
      assert.isTrue(gql`{ sameQuery }` === gql`{ sameQuery }`);
    });

    it('returns the same object for the same query, even with whitespace differences', () => {
      assert.isTrue(gql`{ sameQuery }` === gql`  { sameQuery,   }`);
    });

    it('is correct for a simple query', () => {
      const ast = gql`
        {
          user(id: 5) {
            firstName
            lastName
          }
        }
      `;

      assert.equal(ast.kind, "Document");
      assert.deepEqual(ast.definitions, [
        {
          "kind": "OperationDefinition",
          "operation": "query",
          "name": null,
          "variableDefinitions": null,
          "directives": [],
          "selectionSet": {
            "kind": "SelectionSet",
            "selections": [
              {
                "kind": "Field",
                "alias": null,
                "name": {
                  "kind": "Name",
                  "value": "user"
                },
                "arguments": [
                  {
                    "kind": "Argument",
                    "name": {
                      "kind": "Name",
                      "value": "id"
                    },
                    "value": {
                      "kind": "IntValue",
                      "value": "5"
                    }
                  }
                ],
                "directives": [],
                "selectionSet": {
                  "kind": "SelectionSet",
                  "selections": [
                    {
                      "kind": "Field",
                      "alias": null,
                      "name": {
                        "kind": "Name",
                        "value": "firstName"
                      },
                      "arguments": [],
                      "directives": [],
                      "selectionSet": null
                    },
                    {
                      "kind": "Field",
                      "alias": null,
                      "name": {
                        "kind": "Name",
                        "value": "lastName"
                      },
                      "arguments": [],
                      "directives": [],
                      "selectionSet": null
                    }
                  ]
                }
              }
            ]
          }
        }
      ]);
    });

    it('returns the same object for the same fragment', () => {
      assert.isTrue(gql`fragment same on Same { sameQuery }` ===
        gql`fragment same on Same { sameQuery }`);
    });

    it('is correct for a fragment', () => {
      const ast = gql`
        fragment UserFragment on User {
          firstName
          lastName
        }
      `;

      assert.equal(ast.kind, "Document");
      assert.deepEqual(ast.definitions, [
        {
          "kind": "FragmentDefinition",
          "name": {
            "kind": "Name",
            "value": "UserFragment"
          },
          "typeCondition": {
            kind: "NamedType",
            "name": {
              "kind": "Name",
              "value": "User"
            }
          },
          "directives": [],
          "selectionSet": {
            "kind": "SelectionSet",
            "selections": [
              {
                "kind": "Field",
                "alias": null,
                "name": {
                  "kind": "Name",
                  "value": "firstName"
                },
                "arguments": [],
                "directives": [],
                "selectionSet": null
              },
              {
                "kind": "Field",
                "alias": null,
                "name": {
                  "kind": "Name",
                  "value": "lastName"
                },
                "arguments": [],
                "directives": [],
                "selectionSet": null
              }
            ]
          }
        }
      ]);
    });

    const fragmentAst = gql`
      fragment UserFragment on User {
        firstName
        lastName
      }
    `;
    it('can reference a fragment passed as a document', () => {
      const ast = gql`
        {
          user(id: 5) {
            ...UserFragment
          }
        }
        ${fragmentAst}
      `;

      assert.deepEqual(ast, gql`
        {
          user(id: 5) {
            ...UserFragment
          }
        }
        fragment UserFragment on User {
          firstName
          lastName
        }
      `);
    });

    it('returns the same object for the same document with substitution', () => {
      // We know that calling `gql` on a fragment string will always return
      // the same document, so we can reuse `fragmentAst`
      assert.isTrue(gql`{ ...UserFragment } ${fragmentAst}` ===
        gql`{ ...UserFragment } ${fragmentAst}`);
    });

    it('can reference a fragment that references as fragment', () => {
      const secondFragmentAst = gql`
        fragment SecondUserFragment on User {
          ...UserFragment
        }
        ${fragmentAst}
      `;

      const ast = gql`
        {
          user(id: 5) {
            ...SecondUserFragment
          }
        }
        ${secondFragmentAst}
      `;

      assert.deepEqual(ast, gql`
        {
          user(id: 5) {
            ...SecondUserFragment
          }
        }
        fragment SecondUserFragment on User {
          ...UserFragment
        }
        fragment UserFragment on User {
          firstName
          lastName
        }
      `);
    });

    describe('fragment warnings', () => {
      let warnings = [];
      const oldConsoleWarn = console.warn;
      beforeEach(() => {
        gqlRequire.resetCaches();
        warnings = [];
        console.warn = (w) => warnings.push(w);
      });
      afterEach(() => {
        console.warn = oldConsoleWarn;
      });

      it('warns if you use the same fragment name for different fragments', () => {
        const frag1 = gql`fragment TestSame on Bar { fieldOne }`;
        const frag2 = gql`fragment TestSame on Bar { fieldTwo }`;

        assert.isFalse(frag1 === frag2);
        assert.equal(warnings.length, 1);
      });

      it('does not warn if you use the same fragment name for the same fragment', () => {
        const frag1 = gql`fragment TestDifferent on Bar { fieldOne }`;
        const frag2 = gql`fragment TestDifferent on Bar { fieldOne }`;

        assert.isTrue(frag1 === frag2);
        assert.equal(warnings.length, 0);
      });

      it('does not warn if you use the same embedded fragment in two different queries', () => {
        const frag1 = gql`fragment TestEmbedded on Bar { field }`;
        const query1 = gql`{ bar { fieldOne ...TestEmbedded } } ${frag1}`;
        const query2 = gql`{ bar { fieldTwo ...TestEmbedded } } ${frag1}`;

        assert.isFalse(query1 === query2);
        assert.equal(warnings.length, 0);
      });

      it('does not warn if you use the same fragment name for embedded and non-embedded fragments', () => {
        const frag1 = gql`fragment TestEmbeddedTwo on Bar { field }`;
        const query1 = gql`{ bar { ...TestEmbedded } } ${frag1}`;
        const query2 = gql`{ bar { ...TestEmbedded } } fragment TestEmbeddedTwo on Bar { field }`;

        assert.equal(warnings.length, 0);
      });
    });

    // How to make this work?
    // it.only('can reference a fragment passed as a document via shorthand', () => {
    //   const ast = gql`
    //     {
    //       user(id: 5) {
    //         ...${userFragmentDocument}
    //       }
    //     }
    //   `;
    //
    //   assert.deepEqual(ast, gql`
    //     {
    //       user(id: 5) {
    //         ...UserFragment
    //       }
    //     }
    //     fragment UserFragment on User {
    //       firstName
    //       lastName
    //     }
    //   `);
    // });

  });
});

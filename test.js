const gqlRequire = require('./');
const gqlDefault = require('./').default;
const loader = require('./loader');
const assert = require('chai').assert;

[gqlRequire, gqlDefault].forEach((gql, i) => {
  describe(`gql ${i}`, () => {
    it('parses queries', () => {
      assert.equal(gql`{ testQuery }`.kind, 'Document');
    });

    it('parses queries through webpack loader', () => {
      const source = loader.call({ cacheable() {} }, '{ testQuery }');
      const ast = JSON.parse(source.replace('module.exports = ', '').slice(0, -1));

      assert.equal(ast.kind, 'Document');
    });

    it('returns the same object for the same query', () => {
      assert.isTrue(gql`{ sameQuery }` === gql`{ sameQuery }`);
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

      assert.deepEqual(ast, {
        "kind": "Document",
        "definitions": [
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
        ]
      })
    });

    const userFragmentDocument = {
      "kind": "Document",
      "definitions": [
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
      ]
    };

    it('is correct for a fragment', () => {
      const ast = gql`
        fragment UserFragment on User {
          firstName
          lastName
        }
      `;

      assert.deepEqual(ast, userFragmentDocument);
    });

    it.only('can reference a fragment passed as a document', () => {
      const ast = gql`
        {
          user(id: 5) {
            ...UserFragment
          }
        }
        ${userFragmentDocument}
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

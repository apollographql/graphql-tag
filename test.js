var gqlRequire = require('./index');
var gqlDefault = require('./index').default;
var assert = require('chai').assert;

[gqlRequire, gqlDefault].forEach((gql, i) => {
  describe(`gql ${i}`, () => {
    it('parses queries', () => {
      assert.equal(gql`{ testQuery }`.kind, 'Document');
    });

    it('only parses document once for the same query', () => {
      assert.isTrue(gql`{ sameQuery }`.definitions[0] === gql`{ sameQuery }`.definitions[0]);
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
    })

    it('warns once on arbitrary string interpolation', () => {
      var count = 0;
      var _warn = console.warn
      console.warn = () => {
        count++
      }
      gql`{
        ${'someValue'}
        ${'someOtherValue'}
      }`
      assert.equal(count, 2)
      console.warn = _warn
    })

    it('allows interpolating fragments', () => {

      var frag1 = gql`fragment a on User { fieldA }`

      var frag2 = gql`fragment b on User { fieldB }`

      var frag3 = gql`
        fragment profileFrag on User {
          ${frag1}
          ${frag2}
          fieldC
        }
      `

      var ast = gql`{
        me {
          fieldD
          ${frag3}
        }
      }`

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
                    "value": "me"
                  },
                  "arguments": [],
                  "directives": [],
                  "selectionSet": {
                    "kind": "SelectionSet",
                    "selections": [
                      {
                        "kind": "Field",
                        "alias": null,
                        "name": {
                          "kind": "Name",
                          "value": "fieldD"
                        },
                        "arguments": [],
                        "directives": [],
                        "selectionSet": null
                      },
                      {
                        "kind": "FragmentSpread",
                        "name": {
                          "kind": "Name",
                          "value": "profileFrag"
                        },
                        "directives": []
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            "kind": "FragmentDefinition",
            "name": {
              "kind": "Name",
              "value": "profileFrag"
            },
            "typeCondition": {
              "kind": "NamedType",
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
                  "kind": "FragmentSpread",
                  "name": {
                    "kind": "Name",
                    "value": "a"
                  },
                  "directives": []
                },
                {
                  "kind": "FragmentSpread",
                  "name": {
                    "kind": "Name",
                    "value": "b"
                  },
                  "directives": []
                },
                {
                  "kind": "Field",
                  "alias": null,
                  "name": {
                    "kind": "Name",
                    "value": "fieldC"
                  },
                  "arguments": [],
                  "directives": [],
                  "selectionSet": null
                }
              ]
            }
          },
          {
            "kind": "FragmentDefinition",
            "name": {
              "kind": "Name",
              "value": "a"
            },
            "typeCondition": {
              "kind": "NamedType",
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
                    "value": "fieldA"
                  },
                  "arguments": [],
                  "directives": [],
                  "selectionSet": null
                }
              ]
            }
          },
          {
            "kind": "FragmentDefinition",
            "name": {
              "kind": "Name",
              "value": "b"
            },
            "typeCondition": {
              "kind": "NamedType",
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
                    "value": "fieldB"
                  },
                  "arguments": [],
                  "directives": [],
                  "selectionSet": null
                }
              ]
            }
          }
        ]
      })
    })
  });
});

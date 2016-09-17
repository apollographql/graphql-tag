var gqlRequire = require('./index');
var gqlDefault = require('./index').default;
var assert = require('chai').assert;

[gqlRequire, gqlDefault].forEach((gql, i) => {
  describe(`gql ${i}`, () => {
    it('parses queries', () => {
      assert.equal(gql`{ testQuery }`.kind, 'Document');
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
    })
  });
});

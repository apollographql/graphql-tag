import gql from '../src';

describe(`gql v0.12`, () => {
  it("is correct for a simple query", () => {
    const ast = gql`
      {
        user(id: 5) {
          firstName
          lastName
        }
      }
    `;

    expect(ast.kind).toEqual("Document");
    expect(ast.definitions).toEqual([
      {
        kind: "OperationDefinition",
        operation: "query",
        name: undefined,
        variableDefinitions: [],
        directives: [],
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              alias: undefined,
              name: {
                kind: "Name",
                value: "user"
              },
              arguments: [
                {
                  kind: "Argument",
                  name: {
                    kind: "Name",
                    value: "id"
                  },
                  value: {
                    kind: "IntValue",
                    value: "5"
                  }
                }
              ],
              directives: [],
              selectionSet: {
                kind: "SelectionSet",
                selections: [
                  {
                    kind: "Field",
                    alias: undefined,
                    name: {
                      kind: "Name",
                      value: "firstName"
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: undefined
                  },
                  {
                    kind: "Field",
                    alias: undefined,
                    name: {
                      kind: "Name",
                      value: "lastName"
                    },
                    arguments: [],
                    directives: [],
                    selectionSet: undefined
                  }
                ]
              }
            }
          ]
        }
      }
    ]);
  });

  it("is correct for a fragment", () => {
    const ast = gql`
      fragment UserFragment on User {
        firstName
        lastName
      }
    `;

    expect(ast.kind).toEqual("Document");
    expect(ast.definitions).toEqual([
      {
        kind: "FragmentDefinition",
        name: {
          kind: "Name",
          value: "UserFragment"
        },
        typeCondition: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: "User"
          }
        },
        directives: [],
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              alias: undefined,
              name: {
                kind: "Name",
                value: "firstName"
              },
              arguments: [],
              directives: [],
              selectionSet: undefined
            },
            {
              kind: "Field",
              alias: undefined,
              name: {
                kind: "Name",
                value: "lastName"
              },
              arguments: [],
              directives: [],
              selectionSet: undefined
            }
          ]
        }
      }
    ]);
  });
});

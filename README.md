# graphql-tag

[![npm](https://img.shields.io/npm/v/graphql-tag.svg?maxAge=2592000)](https://www.npmjs.com/package/graphql-tag)
[![Build Status](https://travis-ci.org/apollostack/graphql-tag.svg?branch=master)](https://travis-ci.org/apollostack/graphql-tag)
[![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](http://www.apollostack.com/#slack)

A JavaScript template literal tag that parses GraphQL queries into the standard GraphQL AST.

```js
import gql from 'graphql-tag';

const query = gql`
  {
    user(id: 5) {
      firstName
      lastName
    }
  }
`

// query is now a GraphQL syntax tree object
console.log(query);

// {
//   "kind": "Document",
//   "definitions": [
//     {
//       "kind": "OperationDefinition",
//       "operation": "query",
//       "name": null,
//       "variableDefinitions": null,
//       "directives": [],
//       "selectionSet": {
//         "kind": "SelectionSet",
//         "selections": [
//           {
//             "kind": "Field",
//             "alias": null,
//             "name": {
//               "kind": "Name",
//               "value": "user",
//               ...
```

You can easily explore GraphQL ASTs on [astexplorer.net](https://astexplorer.net/#/drYr8X1rnP/1).

This package is the way to pass queries into [Apollo Client](https://github.com/apollostack/apollo-client). If you're building a GraphQL client, you can use it too!

### Why use this?

GraphQL strings are the right way to write queries in your code, because they can be statically analyzed using tools like [eslint-plugin-graphql](https://github.com/apollostack/eslint-plugin-graphql). However, strings are inconvenient to manipulate, if you are trying to do things like add extra fields, merge multiple queries together, or other interesting stuff.

That's where this package comes in - it lets you write your queries with [ES2015 template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) and compile them into an AST with the `gql` tag.

### Caching parse results

This package only has one feature - it caches previous parse results in a simple dictionary. This means that if you call the tag on the same query multiple times, it doesn't waste time parsing it again. It also means you can use `===` to compare queries to check if they are identical.

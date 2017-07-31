# graphql-tag
[![npm version](https://badge.fury.io/js/graphql-tag.svg)](https://badge.fury.io/js/graphql-tag)
[![Build Status](https://travis-ci.org/apollographql/graphql-tag.svg?branch=master)](https://travis-ci.org/apollographql/graphql-tag)
[![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](http://www.apollodata.com/#slack)

GraphQL printing and parsing with bundled dependencies. Includes:

- `gql` A JavaScript template literal tag that parses GraphQL query strings into the standard GraphQL AST.
- `/loader` A webpack loader to preprocess queries

### gql

This is a template literal tag you can use to concisely write a GraphQL query that is parsed into the standard GraphQL AST:

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

#### Why use this?

GraphQL strings are the right way to write queries in your code, because they can be statically analyzed using tools like [eslint-plugin-graphql](https://github.com/apollostack/eslint-plugin-graphql). However, strings are inconvenient to manipulate, if you are trying to do things like add extra fields, merge multiple queries together, or other interesting stuff.

That's where this package comes in - it lets you write your queries with [ES2015 template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) and compile them into an AST with the `gql` tag.

#### Caching parse results

This package only has one feature - it caches previous parse results in a simple dictionary. This means that if you call the tag on the same query multiple times, it doesn't waste time parsing it again. It also means you can use `===` to compare queries to check if they are identical.

### Babel preprocessing

GraphQL queries can be compiled at build time using [babel-plugin-graphql-tag](https://github.com/gajus/babel-plugin-graphql-tag). Pre-compiling queries decreases the script initialization time and reduces the bundle size by potentially removing the need for `graphql-tag` at runtime.

#### React Native, Next.js
Additionally, in certain situations, preprocessing queries via the webpack loader is not possible. [babel-plugin-inline-import-graphql-ast](https://www.npmjs.com/package/babel-plugin-inline-import-graphql-ast) will allow one to import graphql files directly into your JavaScript by preprocessing GraphQL queries into ASTs at compile-time.

E.g.:
```javascript
import myImportedQuery from './productsQuery.graphql'
 
class ProductsPage extends React.Component {
  ...
}
```

### Webpack preprocessing

This package also includes a [webpack loader](https://webpack.js.org/concepts/loaders). There are many benefits over this approach, which saves GraphQL ASTs processing time on client-side and enable queries to be separated from script over `.graphql` files.

```js
loaders: [
  {
    test: /\.(graphql|gql)$/,
    exclude: /node_modules/,
    loader: 'graphql-tag/loader'
  }
]
```

then:

```js
import query from './query.graphql';

console.log(query);
// {
//   "kind": "Document",
// ...
```

Testing environments that don't support Webpack require additional configuration. For [Jest](https://facebook.github.io/jest/) use [jest-transform-graphql](https://github.com/remind101/jest-transform-graphql).

### Warnings

This package will emit a warning if you have multiple fragments of the same name. You can disable this with:

```js
import { disableFragmentWarnings } from 'graphql-tag';

disableFragmentWarnings()
```

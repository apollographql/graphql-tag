# Change log

### v0.1.17

- Allow embedding fragments inside document strings, as in

```js
import gql from 'graphql-tag';

const fragment = gql`
fragment Foo on Bar {
  field
}
`;

const query = gql`
{
  ...Foo
}
${Foo}
`
```

See also http://dev.apollodata.com/react/fragments.html

### v0.1.16

- Add caching to Webpack loader. [PR #16](https://github.com/apollostack/graphql-tag/pull/16)

### v0.1.15

- Add Webpack loader to `graphql-tag/loader`.

### v0.1.14

Changes were not tracked before this version.

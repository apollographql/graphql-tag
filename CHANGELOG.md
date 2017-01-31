# Change log
### v1.2.2
Restore Node < 6 compatibility. [DragosRotaru](https://github.com/DragosRotaru) in [PR #41](https://github.com/apollographql/graphql-tag/pull/41) addressing [#39](https://github.com/apollographql/graphql-tag/issues/39)

### v1.2.1
Fixed an issue with fragment imports. [PR #35](https://github.com/apollostack/graphql-tag/issues/35).

### v1.2.0

Added ability to import other GraphQL documents with fragments using `#import` comments. [PR #33](https://github.com/apollostack/graphql-tag/pull/33)

### v1.1.2

Fix issue with interpolating undefined values [Issue #19](https://github.com/apollostack/graphql-tag/issues/19)

### v1.1.1

Added typescript definitions for the below.

### v1.1.0

We now emit warnings if you use the same name for two different fragments.

You can disable this with:

```js
import { disableFragmentWarnings } from 'graphql-tag';

disableFragmentWarnings()
```

### v1.0.0

Releasing 0.1.17 as 1.0.0 in order to be explicit about Semantic Versioning.

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

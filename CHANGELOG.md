# Change log

### v2.9.0
* Remove duplicate exports in named exports by [wacii](https://github.com/wacii) in [#170](https://github.com/apollographql/graphql-tag/pull/170)
* Add `experimentalFragmentVariables` compatibility by [lucasconstantino](https://github.com/lucasconstantino) in [#167](https://github.com/apollographql/graphql-tag/pull/167/)

### v2.8.0

* Update `graphql` to ^0.13, support testing all compatible versions [jnwng](https://github.com/jnwng) in
  [PR #156](https://github.com/apollographql/graphql-tag/pull/156)
* Export single queries as both default and named [stonexer](https://github.com/stonexer) in
  [PR #154](https://github.com/apollographql/graphql-tag/pull/154)

### v2.7.{0,1,2,3}

* Merge and then revert [PR #141](https://github.com/apollographql/graphql-tag/pull/141) due to errors being thrown

### v2.6.1

* Accept `graphql@^0.12.0` as peerDependency [jnwng](https://github.com/jnwng)
  addressing [#134](https://github.com/apollographql/graphql-tag/issues/134)

### v2.6.0

* Support multiple query definitions when using Webpack loader [jfaust](https://github.com/jfaust) in
  [PR #122](https://github.com/apollographql/graphql-tag/pull/122)

### v2.5.0

* Update graphql to ^0.11.0, add graphql@^0.11.0 to peerDependencies [pleunv](https://github.com/pleunv) in
  [PR #124](https://github.com/apollographql/graphql-tag/pull/124)

### v2.4.{1,2}

* Temporarily reverting [PR #99](https://github.com/apollographql/graphql-tag/pull/99) to investigate issues with
  bundling

### v2.4.0

* Add support for descriptors [jamiter](https://github.com/jamiter) in
  [PR #99](https://github.com/apollographql/graphql-tag/pull/99)

### v2.3.0

* Add flow support [michalkvasnicak](https://github.com/michalkvasnicak) in
  [PR #98](https://github.com/apollographql/graphql-tag/pull/98)

### v2.2.2

* Make parsing line endings kind agnostic [vlasenko](https://github.com/vlasenko) in
  [PR #95](https://github.com/apollographql/graphql-tag/pull/95)

### v2.2.1

* Fix #61: split('/n') does not work on Windows [dnalborczyk](https://github.com/dnalborczyk) in
  [PR #89](https://github.com/apollographql/graphql-tag/pull/89)

### v2.2.0

* Bumping `graphql` peer dependency to ^0.10.0 [dotansimha](https://github.com/dotansimha) in
  [PR #85](https://github.com/apollographql/graphql-tag/pull/85)

### v2.1.0

* Add support for calling `gql` as a function [matthewerwin](https://github.com/matthewerwin) in
  [PR #66](https://github.com/apollographql/graphql-tag/pull/66)
* Including yarn.lock file [PowerKiKi](https://github.com/PowerKiKi) in
  [PR #72](https://github.com/apollographql/graphql-tag/pull/72)
* Ignore duplicate fragments when using the Webpack loader [czert](https://github.com/czert) in
  [PR #52](https://github.com/apollographql/graphql-tag/pull/52)
* Fixing `graphql-tag/loader` by properly stringifying GraphQL Source [jnwng](https://github.com/jnwng) in
  [PR #65](https://github.com/apollographql/graphql-tag/pull/65)

### v2.0.0

Restore dependence on `graphql` module [abhiaiyer91](https://github.com/abhiaiyer91) in
[PR #46](https://github.com/apollographql/graphql-tag/pull/46) addressing
[#6](https://github.com/apollographql/graphql-tag/issues/6)

* Added `graphql` as a
  [peerDependency](https://github.com/apollographql/graphql-tag/commit/ac061dd16440e75c166c85b4bff5ba06c79c9356)

### v1.3.2

* Add typescript definitions for the bundledPrinter [PR #63](https://github.com/apollographql/graphql-tag/pull/63)

### v1.3.1

* Making sure not to log deprecation warnings for internal use of deprecated module [jnwng](https://github.com/jnwng)
  addressing [#54](https://github.com/apollographql/graphql-tag/issues/54#issuecomment-283301475)

### v1.3.0

* Bump bundled `graphql` packages to v0.9.1 [jnwng](https://github.com/jnwng) in
  [PR #55](https://github.com/apollographql/graphql-tag/pull/55).
* Deprecate the `graphql/language/parser` and `graphql/language/printer` exports [jnwng](https://github.com/jnwng) in
  [PR #55](https://github.com/apollographql/graphql-tag/pull/55)

### v1.2.4

Restore Node < 6 compatibility. [DragosRotaru](https://github.com/DragosRotaru) in
[PR #41](https://github.com/apollographql/graphql-tag/pull/41) addressing
[#39](https://github.com/apollographql/graphql-tag/issues/39)

### v1.2.1

Fixed an issue with fragment imports. [PR #35](https://github.com/apollostack/graphql-tag/issues/35).

### v1.2.0

Added ability to import other GraphQL documents with fragments using `#import` comments.
[PR #33](https://github.com/apollostack/graphql-tag/pull/33)

### v1.1.2

Fix issue with interpolating undefined values [Issue #19](https://github.com/apollostack/graphql-tag/issues/19)

### v1.1.1

Added typescript definitions for the below.

### v1.1.0

We now emit warnings if you use the same name for two different fragments.

You can disable this with:

```js
import { disableFragmentWarnings } from 'graphql-tag';

disableFragmentWarnings();
```

### v1.0.0

Releasing 0.1.17 as 1.0.0 in order to be explicit about Semantic Versioning.

### v0.1.17

* Allow embedding fragments inside document strings, as in

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
`;
```

See also http://dev.apollodata.com/react/fragments.html

### v0.1.16

* Add caching to Webpack loader. [PR #16](https://github.com/apollostack/graphql-tag/pull/16)

### v0.1.15

* Add Webpack loader to `graphql-tag/loader`.

### v0.1.14

Changes were not tracked before this version.

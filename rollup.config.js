import sourceMapsPlugin from 'rollup-plugin-sourcemaps';

const globals = {
  tslib: 'tslib',
  graphql: 'graphql',
  chai: 'chai',
  'lru-cache': 'LRU',
  'source-map-support/register': 'sourceMapSupport',
};

const { hasOwnProperty } = Object.prototype;
function external(id) {
  return hasOwnProperty.call(globals, id);
}

export default [
  {
    input: 'lib/index.js',
    plugins: [
      sourceMapsPlugin(),
    ],
    external,
    output: [
      {
        file: 'lib/graphql-tag.umd.js',
        format: 'umd',
        globals,
        name: 'graphql-tag',
        sourcemap: true,
        exports: 'named'
      }
    ],
  },
  {
    input: 'lib/tests.js',
    plugins: [
      sourceMapsPlugin(),
    ],
    external,
    output: [
      {
        file: 'lib/tests.cjs.js',
        format: 'commonjs',
        globals,
        name: 'graphql-tag/tests',
        sourcemap: true,
        exports: 'named'
      }
    ],
  },
];

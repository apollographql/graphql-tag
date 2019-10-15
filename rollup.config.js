export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/graphql-tag.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'lib/graphql-tag.umd.js',
      format: 'umd',
      globals: {
        'graphql/language': 'language'
      },
      name: 'graphql-tag',
      sourcemap: true,
      exports: 'named'
    }
  ],
  onwarn
};

function onwarn(message) {
  const suppressed = [
    'UNRESOLVED_IMPORT',
    'THIS_IS_UNDEFINED'
  ];

  if (!suppressed.find(code => message.code === code)) {
    return console.warn(message.message);
  }
}

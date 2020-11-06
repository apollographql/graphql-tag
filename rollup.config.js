export default {
  input: 'src/index.js',
  output: {
    file: 'lib/graphql-tag.umd.js',
    format: 'umd',
    name: 'graphql-tag',
    sourcemap: true
  },
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

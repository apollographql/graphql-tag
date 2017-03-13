export default {
  entry: 'src/index.js',
  dest: 'lib/apollo.umd.js',
  format: 'umd',
  sourceMap: true,
  moduleName: 'graphql-tag',
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

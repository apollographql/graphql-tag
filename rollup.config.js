function umd(input, output) {
  return {
    entry: input,
    dest: output,
    format: 'umd',
    sourceMap: true,
    moduleName: 'graphql-tag',
    onwarn
  }
}

function cjs(input, output) {
  return {
    entry: input,
    dest: output,
    format: 'cjs',
    sourceMap: true,
    moduleName: 'graphql-tag',
    onwarn
  }
}

function esm(input, output) {
  return {
    entry: input,
    dest: output,
    format: 'es',
    sourceMap: true,
    moduleName: 'graphql-tag',
    onwarn
  }
}

function onwarn(message) {
  const suppressed = [
    'UNRESOLVED_IMPORT',
    'THIS_IS_UNDEFINED'
  ];

  if (!suppressed.find(code => message.code === code)) {
    return console.warn(message.message);
  }
}

export default [
  esm('src/index.js', 'lib/graphql-tag.esm.js'),
  umd('src/index.js', 'lib/graphql-tag.umd.js'),
  cjs('src/index.js', 'lib/graphql-tag.cjs.js'),
];

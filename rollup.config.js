import typescript from 'typescript';
import typescriptPlugin from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';
import node from 'rollup-plugin-node-resolve';

function onwarn(message) {
  const suppressed = [
    'UNRESOLVED_IMPORT',
    'THIS_IS_UNDEFINED'
  ];

  if (!suppressed.find(code => message.code === code)) {
    return console.warn(message.message);
  }
}

function umd(input, output) {
  return {
    input,
    output: {
      file: output,
      format: 'umd',
      name: 'graphql-tag'
    },
    sourceMap: true,
    onwarn,
    plugins: [
      node({
        module: true,
        only: ['tslib']
      }),
      typescriptPlugin({ typescript, tsconfig: './tsconfig.json' }),
      filesize(),
    ]
  }
}

function esm(input, output) {
  return {
    input,
    output: {
      file: output,
      format: 'esm',
    },
    sourceMap: true,
    onwarn,
    plugins: [
      node({
        module: true,
        only: ['tslib']
      }),
      typescriptPlugin({ typescript, tsconfig: './tsconfig.json' }),
      filesize(),
    ]
  }
}

export default [
  esm('lib/index.js', 'lib/graphql-tag.esm.js'),
  umd('lib/index.js', 'lib/graphql-tag.umd.js'),
];

"use strict";

const gql = require('./src');

// Takes `source` (the source GraphQL query string)
// and `doc` (the parsed GraphQL document) and tacks on
// the imported definitions.
function expandImports(source, doc) {
  const lines = source.split('\n');
  let outputCode = "";

  lines.some((line) => {
    if (line[0] === '#' && line.slice(1).split(' ')[0] === 'import') {
      const importFile = line.slice(1).split(' ')[1];
      const parseDocument = `require(${importFile})`;
      const appendDef = `doc.definitions = doc.definitions.concat(${parseDocument}.definitions);`;
      outputCode += appendDef + "\n";
    }
    return (line.length !== 0 && line[0] !== '#');
  });

  return outputCode;
}

module.exports = function(source) {
  this.cacheable();
  const doc = gql`${source}`;
  const outputCode = `var doc = ${JSON.stringify(doc)};`;
  const importOutputCode = expandImports(source, doc);

  return outputCode + "\n" + importOutputCode + "\n" + `module.exports = doc;`;
};

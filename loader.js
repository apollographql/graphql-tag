"use strict";

const os = require('os');
const gql = require('./src');

// Takes `source` (the source GraphQL query string) and `doc` (the parsed GraphQL document)
// and tacks on the imported definitions.
function expandImports(source, doc) {
  const lines = source.split(/\r\n|\r|\n/);
  let outputCode = `
    var names = {};
    function unique(defs) {
      return defs.filter(
        function(def) {
          if (def.kind !== 'FragmentDefinition') return true;
          var name = def.name.value;
          // Filter out if seen; otherwise mark as seen and include.
          return names[name] ? false : names[name] = true;
        }
      );
    }
  `;

  lines.some((line) => {
    if (line.substr(0, 7) === '#import') {
      const importFile = line.split(' ')[1];
      const parseDocument = `require(${importFile})`;
      const appendDef = `doc.definitions = doc.definitions.concat(unique(${parseDocument}.definitions));`;
      outputCode += appendDef + os.EOL;
    }
    return (line.length !== 0 && line[0] !== '#');
  });

  return outputCode;
}

module.exports = function(source) {
  this.cacheable();
  const doc = gql`${source}`;
  let headerCode = `
    var doc = ${JSON.stringify(doc)};
    doc.loc.source = ${JSON.stringify(doc.loc.source)};
  `;

  let outputCode = `
    module.exports = doc;
  `;

  // Allow multiple query/mutation definitions in a file. This parses out dependencies
  // at compile time, and then uses those at load time to create minimal query documents
  // We cannot do the latter at compile time due to how the #import code works.
  const countReducer = (accum, op) => op.kind === "OperationDefinition" ? accum + 1 : accum;
  let operationCount = doc.definitions.reduce(countReducer, 0);

  if (operationCount > 1) {
    outputCode += `
      var separateOperations = require('graphql/utilities/separateOperations').separateOperations;
    `;
  }

  for (const op of doc.definitions) {
    const opName = op.name && op.name.value;
    if (op.kind === "OperationDefinition") {
      if (operationCount > 1) {
        const errMsg = "Query/mutation names are required for a document with multiple definitions";
        if (!opName) throw errMsg;
        outputCode += 'module.exports = separateOperations(doc);';
      } else if (opName) {
        outputCode += `module.exports["${opName}"] = doc;`;
      }
    }
  }

  const importOutputCode = expandImports(source, doc);
  return headerCode + os.EOL + importOutputCode + os.EOL + outputCode + os.EOL;
};

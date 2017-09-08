"use strict";

const os = require('os');
const gql = require('./src');

// Takes `source` (the source GraphQL query string)
// and `doc` (the parsed GraphQL document) and tacks on
// the imported definitions.
function expandImports(source, doc) {
  const lines = source.split(/\r\n|\r|\n/);
  let outputCode = `
    var names = {};
    function unique(defs) {
      return defs.filter(
        function(def) {
          if (def.kind !== 'FragmentDefinition') return true;
          var name = def.name.value
          if (names[name]) {
            return false;
          } else {
            names[name] = true;
            return true;
          }
        }
      )
    }
  `;

  lines.some((line) => {
    if (line[0] === '#' && line.slice(1).split(' ')[0] === 'import') {
      const importFile = line.slice(1).split(' ')[1];
      const parseDocument = `require(${importFile})`;
      const appendDef = `doc.definitions = doc.definitions.concat(unique(${parseDocument}.definitions));`;
      outputCode += appendDef + os.EOL;
    }
    return (line.length !== 0 && line[0] !== '#');
  });

  return outputCode;
}

// Collect any fragment/type references from a node, adding them to the refs Set
function collectFragmentReferences(node, refs) {
  if (node.kind === "FragmentSpread") {
    refs.add(node.name.value);
  } else if (node.kind === "VariableDefinition") {
    const type = node.type;
    if (type.kind === "NamedType") {
      refs.add(type.name.value);
    }
  }

  if (node.selectionSet) {
    for (const selection of node.selectionSet.selections) {
      collectFragmentReferences(selection, refs);
    }
  }

  if (node.variableDefinitions) {
    for (const def of node.variableDefinitions) {
      collectFragmentReferences(def, refs);
    }
  }

  if (node.definitions) {
    for (const def of node.definitions) {
      collectFragmentReferences(def, refs);
    }
  }
}

module.exports = function(source) {
  this.cacheable();
  const doc = gql`${source}`;
  let outputCode = `
    function oneQuery(doc, refs, operationName) {
      const newDoc = Object.assign({}, doc);
      // Filter out operations
      newDoc.definitions = newDoc.definitions.filter(function(def) {
        return def.kind !== "OperationDefinition" || def.name.value === operationName;
      });
      
      // Now, for the operation we're running, only include fragments it references
      const refsSet = new Set(refs);
      newDoc.definitions = newDoc.definitions.filter(function(def) {
        return def.kind !== "FragmentDefinition" || refsSet.has(def.name.value);
      });
    
      return newDoc;
    }

    var doc = ${JSON.stringify(doc)};
    doc.loc.source = ${JSON.stringify(doc.loc.source)};
    module.exports = {};
  `;

  // Allow multiple query/mutation definitions in a file. This parses out dependencies
  // at compile time, and then uses those at load time to create minimal query documents
  // We cannot do the latter at compile time due to how the #import code works.
  let operationCount = 0;
  for (const op of doc.definitions) {
    if (op.kind === "OperationDefinition") {
      ++operationCount;
      const opName = op.name.value;
      const opQueryRefs = new Set();
      collectFragmentReferences(op, opQueryRefs);
      outputCode += `
      var ${opName}Refs = ${JSON.stringify(Array.from(opQueryRefs))};
      module.exports["${opName}"] = oneQuery(doc, ${opName}Refs, "${opName}");
      `
    }
  }

  if (operationCount <= 1) {
    outputCode += `
      module.exports = doc;
    `
  }

  const importOutputCode = expandImports(source, doc);
  const allCode = outputCode + os.EOL + importOutputCode + os.EOL;

  return allCode;
};

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

function removeUnusedFragments(doc) {
  let outputCode = `
    var usedFragments = [];
    function findFragmentSpreads(doc, visitor) {
      function traverse(selectionSet) {
        selectionSet.selections.forEach(function(selection) {
          if (selection.kind === "FragmentSpread") {
            usedFragments.push(selection.name.value);
          } else if (selection.selectionSet) {
            traverse(selection.selectionSet);
          }
        });
      }

      doc.definitions.forEach(function(def) {
        if (def.kind === "OperationDefinition") {
          traverse(def.selectionSet);
        }
      });
    }

    findFragmentSpreads(doc);

    function rejectUnusedFragments(def) {
      return def.kind !== "FragmentDefinition" || usedFragments.indexOf(def.name.value) !== -1;
    }
  `;
  const appendDef = `doc.definitions = doc.definitions.filter(rejectUnusedFragments);`;
  return outputCode + os.EOL + appendDef;
}

module.exports = function(source) {
  this.cacheable();
  const doc = gql`${source}`;
  const outputCode = `
    var doc = ${JSON.stringify(doc)};
    doc.loc.source = ${JSON.stringify(doc.loc.source)};
  `;
  const importOutputCode = expandImports(source, doc);
  const filteredOutputCode = removeUnusedFragments(importOutputCode, doc);

  return outputCode + os.EOL + importOutputCode + os.EOL + filteredOutputCode + os.EOL + `module.exports = doc;`;
};

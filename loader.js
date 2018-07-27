"use strict";

const os = require('os');
const gql = require('./src');
const crypto = require('crypto')
const fs = require('fs');
const { ExtractGQL } = require('persistgraphql/lib/src/ExtractGQL');
const queryTransformers = require('persistgraphql/lib/src/queryTransformers');

let queryMap = {};

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

function seedQueryMap(existingQueryMapPath) {
  console.info('Seeding query map...');

  try {
    fs.statSync(existingQueryMapPath);

    console.info(`Query map path found at: ${existingQueryMapPath}`);

    try {
      const existingQueryMap = JSON.parse(fs.readFileSync(existingQueryMapPath, 'utf8'));

      // Seed queryMap with existingQueryMap
      Object.assign(queryMap, existingQueryMap, queryMap);
    } catch (err) {
      console.error(err);
    }
  }
  catch (err) {
    console.error(`Query map path NOT found at: ${existingQueryMapPath}`);
  }
}

function addQueryId(queries, index) {
  const query = queries[index];

  const sha256 = crypto.createHash('sha256');
  const queryId = sha256.update(JSON.stringify(query)).digest('hex');

  // Save queryId to query mapping
  queryMap[queryId] = query;

  return queryId;
}

module.exports = function(source) {
  const {hashQueries = true, existingQueryMapPath, generateHashMap = false} = this.query;

  // If there is an existing query map file that should be the seed, then load it now
  // (but only if it hasn't already been loaded).
  if (hashQueries && existingQueryMapPath && Object.keys(queryMap).length === 0) {
    seedQueryMap(existingQueryMapPath);
  }

  this.cacheable();
  const doc = gql`${source}`;

  let queries = [];
  if (hashQueries) {
    queries = Object.keys(new ExtractGQL({
      queryTransformers: [queryTransformers.addTypenameTransformer].filter(Boolean)
    }).createOutputMapFromString(source));
  }

  let headerCode = `
    var doc = ${JSON.stringify(doc)};
    doc.loc.source = ${JSON.stringify(doc.loc.source)};
  `;

  let outputCode = "";

  // Allow multiple query/mutation definitions in a file. This parses out dependencies
  // at compile time, and then uses those at load time to create minimal query documents
  // We cannot do the latter at compile time due to how the #import code works.
  let operationCount = doc.definitions.reduce(function(accum, op) {
    if (op.kind === "OperationDefinition") {
      return accum + 1;
    }

    return accum;
  }, 0);

  if (operationCount < 1) {
    outputCode += `
    module.exports = doc;
    `
  } else {
    outputCode += `
    // Collect any fragment/type references from a node, adding them to the refs Set
    function collectFragmentReferences(node, refs) {
      if (node.kind === "FragmentSpread") {
        refs.add(node.name.value);
      } else if (node.kind === "VariableDefinition") {
        var type = node.type;
        if (type.kind === "NamedType") {
          refs.add(type.name.value);
        }
      }

      if (node.selectionSet) {
        node.selectionSet.selections.forEach(function(selection) {
          collectFragmentReferences(selection, refs);
        });
      }

      if (node.variableDefinitions) {
        node.variableDefinitions.forEach(function(def) {
          collectFragmentReferences(def, refs);
        });
      }

      if (node.definitions) {
        node.definitions.forEach(function(def) {
          collectFragmentReferences(def, refs);
        });
      }
    }

    var definitionRefs = {};
    (function extractReferences() {
      doc.definitions.forEach(function(def) {
        if (def.name) {
          var refs = new Set();
          collectFragmentReferences(def, refs);
          definitionRefs[def.name.value] = refs;
        }
      });
    })();

    function findOperation(doc, name) {
      for (var i = 0; i < doc.definitions.length; i++) {
        var element = doc.definitions[i];
        if (element.name && element.name.value == name) {
          return element;
        }
      }
    }

    function oneQuery(doc, operationName, queryId) {    
      // Copy the DocumentNode, but clear out the definitions
      var newDoc = {
        kind: doc.kind,
        definitions: [findOperation(doc, operationName)],
        ${hashQueries ? 'queryId: queryId' : ''}
      };
      if (doc.hasOwnProperty("loc")) {
        newDoc.loc = doc.loc;
      }

      // Now, for the operation we're running, find any fragments referenced by
      // it or the fragments it references
      var opRefs = definitionRefs[operationName] || new Set();
      var allRefs = new Set();
      var newRefs = new Set(opRefs);
      while (newRefs.size > 0) {
        var prevRefs = newRefs;
        newRefs = new Set();

        prevRefs.forEach(function(refName) {
          if (!allRefs.has(refName)) {
            allRefs.add(refName);
            var childRefs = definitionRefs[refName] || new Set();
            childRefs.forEach(function(childRef) {
              newRefs.add(childRef);
            });
          }
        });
      }

      allRefs.forEach(function(refName) {
        var op = findOperation(doc, refName);
        if (op) {
          newDoc.definitions.push(op);
        }
      });

      return newDoc;
    }

    module.exports = doc;
    `;

    for (let i = 0; i < doc.definitions.length; i++) {
      const op = doc.definitions[i];

      if (op.kind === "OperationDefinition") {
        let queryId;

        if (!op.name) {
          if (operationCount > 1) {
            throw "Query/mutation names are required for a document with multiple definitions";
          } else {
            if (hashQueries) {
              queryId = addQueryId(queries, 0);

              outputCode += `
                ${hashQueries ? `doc.queryId = '${queryId}';` : ''}
              `;
            }

            continue;
          }
        }

        if (hashQueries) {
          queryId = addQueryId(queries, i);
        }

        const opName = op.name.value;

        outputCode += `
        module.exports["${opName}"] = oneQuery(doc, "${opName}", "${queryId}");
        `
      }
    }
  }

  const importOutputCode = expandImports(source, doc);
  const allCode = headerCode + os.EOL + importOutputCode + os.EOL + outputCode + os.EOL;

  if (hashQueries && generateHashMap) {
    const callback = this.async();

    fs.writeFile('queryIdMap.json', JSON.stringify(queryMap, null, 2), (err) => {
      if (err) return callback(err);

      callback(null, allCode);
    });
  } else {
    return allCode;
  }
};

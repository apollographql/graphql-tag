var parse = require('./parser').parse;

var cache = {};

function stripLoc (doc, removeLocAtThisLevel) {
  var docType = Object.prototype.toString.call(doc);

  if (docType === '[object Array]') {
    return doc.map(function(d) { return stripLoc(d, removeLocAtThisLevel); });
  }

  if (docType !== '[object Object]') {
    throw new Error('Unexpected input.');
  }

  // We don't want to remove the root loc field so we can use it
  // for fragment substitution (see below)
  if (removeLocAtThisLevel && doc.loc) {
    delete doc.loc;
  }

  var keys = Object.keys(doc);
  var key;
  var value;
  var valueType;

  for (key in keys) {
    if (keys.hasOwnProperty(key)) {
      value = doc[keys[key]];
      valueType = Object.prototype.toString.call(value);

      if (valueType === '[object Object]' || valueType === '[object Array]') {
        doc[keys[key]] = stripLoc(value, true);
      }
    }
  }

  return doc;
}

function parseDocument(doc) {
  if (cache[doc]) {
    return cache[doc];
  }

  var parsed = parse(doc);

  if (!parsed || parsed.kind !== 'Document') {
    throw new Error('Not a valid GraphQL document.');
  }

  parsed = stripLoc(parsed, false);

  cache[doc] = parsed;

  return parsed;
}

// XXX This should eventually disallow arbitrary string interpolation, like Relay does
function gql(/* arguments */) {
  var args = Array.prototype.slice.call(arguments);

  var literals = args[0];
  args.shift();
  var substitutions = args;

  var result = '';

  // run the loop only for the substitution count
  for (var i = 0; i < substitutions.length; i++) {
      result += literals[i];

      if (substitutions[i].kind && substitutions[i].kind === 'Document') {
        result += substitutions[i].loc.source.body;
      } else {
        result += substitutions[i];
      }
  }

  // add the last literal
  result += literals[literals.length - 1];

  return parseDocument(result);
}

// Support typescript, which isn't as nice as Babel about default exports
gql.default = gql;

module.exports = gql;

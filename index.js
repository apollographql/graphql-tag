var parse = require('graphql/language/parser').parse;

var cache = {};

function parseDocument(doc) {
  if (cache[doc]) {
    return cache[doc];
  }

  const parsed = parse(doc);

  if (!parsed || parsed.kind !== 'Document') {
    throw new Error('Not a valid GraphQL document.');
  }

  cache[doc] = parsed;

  return parsed;
}

// XXX This should eventually disallow arbitrary string interpolation, like Relay does
function gql(/* arguments */) {
  var args = Array.prototype.slice.call(arguments);

  var literals = args[0];
  var substitutions = args.shift();

  var result = '';

  // run the loop only for the substitution count
  for (var i = 0; i < substitutions.length; i++) {
      result += literals[i];
      result += substitutions[i];
  }

  // add the last literal
  result += literals[literals.length - 1];

  return parseDocument(result);
}

module.exports = gql;

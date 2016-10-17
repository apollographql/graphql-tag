var parse = require('./parser').parse;

var cache = {};

function stripLoc (doc) {
  var docType = Object.prototype.toString.call(doc);

  if (docType === '[object Array]') {
    return doc.map(stripLoc);
  }

  if (docType !== '[object Object]') {
    throw new Error('Unexpected input.');
  }

  if (doc.loc) {
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
        doc[keys[key]] = stripLoc(value);
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

  parsed = stripLoc(parsed);

  cache[doc] = parsed.definitions;

  return cache[doc];
}

// XXX This should eventually disallow arbitrary string interpolation, like Relay does
function gql(/* arguments */) {
  var args = Array.prototype.slice.call(arguments);

  var literals = args[0];
  args.shift();
  var substitutions = args;

  var fragments = []
  var result = '';

  // run the loop only for the substitution count
  for (var i = 0; i < substitutions.length; i++) {
    var substitution = substitutions[i]
    var substitutionType = typeof substitution

    result += literals[i];

    if (substitutionType === 'string') {
      console.warn('gql: Interpolation of arbitrary strings is deprecated')
      result += substitutions[i];
    } else if (
      substitutionType === 'object' && substitution.kind === 'Document'
    ) {
      var fragment = substitution.definitions[0]
      if (fragment.kind !== 'FragmentDefinition') {
        throw new Error('gql: Only fragments may be interpolated, saw ' + fragment.kind)
      }
      result += '...' + fragment.name.value

      for (var j = 0; j < substitution.definitions.length; j++) {
        var frag = substitution.definitions[j]
        if (fragments.indexOf(frag) === -1) {
          fragments.push(frag)
        }
      }
    } else {
      throw new Error('gql: Invalid value interpolated in gql tagged template: ' + substitutionType)
    }
  }

  // add the last literal
  result += literals[literals.length - 1];

  var definitions = parseDocument(result);

  return {
    kind: 'Document',
    definitions: definitions.concat(fragments)
  }
}

// Support typescript, which isn't as nice as Babel about default exports
gql.default = gql;

module.exports = gql;

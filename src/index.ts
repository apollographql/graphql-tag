import { parse } from 'graphql';
import { Location, DocumentNode, DefinitionNode } from 'graphql/language';

// Strip insignificant whitespace
// Note that this could do a lot more, such as reorder fields etc.
function normalize(text: string): string {
  return text.replace(/[\s,]+/g, ' ').trim();
}

type DocCache = { [docString: string]: DocumentNode };
let docCache: DocCache = {};

interface FragmentSourceMap {
  [fragmentName: string]: {
    [source: string]: boolean;
  };
}

// A map fragmentName -> [normalized source]
let fragmentSourceMap: FragmentSourceMap = {};

function cacheKeyFromLoc(loc?: Location): string {
  if (!loc) return '';
  return normalize(loc.source.body.substring(loc.start, loc.end));
}

// For testing.
export function resetCaches(): void {
  docCache = {};
  fragmentSourceMap = {};
}

interface FragmentMap {
  [key: string]: boolean
}

// Take a unstripped parsed document (query/mutation or even fragment), and
// check all fragment definitions, checking for name->source uniqueness.
// We also want to make sure only unique fragments exist in the document.
let printFragmentWarnings = true;
function processFragments(ast: DocumentNode): DocumentNode {
  const astFragmentMap: FragmentMap = {};
  const definitions: DefinitionNode[] = [];

  for (let i = 0; i < ast.definitions.length; i++) {
    const fragmentDefinition = ast.definitions[i];

    if (fragmentDefinition.kind === 'FragmentDefinition') {
      const fragmentName: string = fragmentDefinition.name.value;
      const sourceKey: string = cacheKeyFromLoc(fragmentDefinition.loc);

      // We know something about this fragment
      if (fragmentSourceMap.hasOwnProperty(fragmentName) && !fragmentSourceMap[fragmentName][sourceKey]) {

        // this is a problem because the app developer is trying to register another fragment with
        // the same name as one previously registered. So, we tell them about it.
        if (printFragmentWarnings) {
          console.warn("Warning: fragment with name " + fragmentName + " already exists.\n"
            + "graphql-tag enforces all fragment names across your application to be unique; read more about\n"
            + "this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names");
        }

        fragmentSourceMap[fragmentName][sourceKey] = true;

      } else if (!fragmentSourceMap.hasOwnProperty(fragmentName)) {
        fragmentSourceMap[fragmentName] = {};
        fragmentSourceMap[fragmentName][sourceKey] = true;
      }

      if (!astFragmentMap[sourceKey]) {
        astFragmentMap[sourceKey] = true;
        definitions.push(fragmentDefinition);
      }
    } else {
      definitions.push(fragmentDefinition);
    }
  }

  // TODO: Ts won't allow us to alter this since it's read-only
  (ast as any).definitions = definitions;
  return ast;
}

export function disableFragmentWarnings(): void {
  printFragmentWarnings = false;
}

function stripLoc(doc: Array<DocumentNode> | DocumentNode, removeLocAtThisLevel: number | boolean): DocumentNode  {
  const docType = Object.prototype.toString.call(doc);

  if (docType === '[object Array]' && doc instanceof Array) {
    // This is wrong now because we return a DocumentNode... How do we approach this?
    return doc.map((d: DocumentNode) => stripLoc(d, removeLocAtThisLevel)) as any;
  }

  if (docType !== '[object Object]') {
    throw new Error('Unexpected input.');
  }

  doc = doc as DocumentNode;

  // We don't want to remove the root loc field so we can use it
  // for fragment substitution (see below)
  if (removeLocAtThisLevel && doc.loc) {
    // TODO: TS Does not allow deleting a read-only prop
    delete (doc as any).loc;
  }

  // https://github.com/apollographql/graphql-tag/issues/40
  if (doc.loc) {
    // TODO: TS Does not allow deleting a read-only prop
    delete (doc as any).loc.startToken;
    delete (doc as any).loc.endToken;
  }

  const keys = Object.keys(doc);
  let key;
  let value;
  let valueType;

  for (key in keys) {
    if (keys.hasOwnProperty(key)) {
      // TODO: type this, need some more insight
      value = (doc as any)[keys[key]];
      valueType = Object.prototype.toString.call(value);

      if (valueType === '[object Object]' || valueType === '[object Array]') {
        // TODO: type this, need some more insight
        (doc as any)[keys[key]] = stripLoc(value, true);
      }
    }
  }

  return doc;
}

let experimentalFragmentVariables = false;
function parseDocument(doc: string): DocumentNode {
  const cacheKey = normalize(doc);

  if (docCache[cacheKey]) {
    return docCache[cacheKey];
  }

  // TODO: TS asked to change this from "experimentalFragmentconstiables" to "experimentalFragmentVariables"
  // This should be validated by someone with more knowledge than me.
  let parsed = parse(doc, { experimentalFragmentVariables: experimentalFragmentconstiables });
  if (!parsed || parsed.kind !== 'Document') {
    throw new Error('Not a valid GraphQL document.');
  }

  // check that all "new" fragments inside the documents are consistent with
  // existing fragments of the same name
  parsed = processFragments(parsed);
  parsed = stripLoc(parsed, false);
  docCache[cacheKey] = parsed;

  return parsed;
}

export function enableExperimentalFragmentVariables(): void {
  experimentalFragmentVariables = true;
}

export function disableExperimentalFragmentconstiables(): void {
  experimentalFragmentconstiables = false;
}

// XXX This should eventually disallow arbitrary string interpolation, like Relay does
function gql(...args: Array<any>): DocumentNode {
  const literals: any = args[0];

  // We always get literals[0] and then matching post literals for each arg given
  let result = (typeof(literals) === "string") ? literals : literals[0];

  for (let i = 1; i < args.length; i++) {
    if (args[i] && args[i].kind && args[i].kind === 'Document') {
      result += args[i].loc.source.body;
    } else {
      result += args[i];
    }
    result += (literals[i]);
  }

  return parseDocument(result);
}

export default gql;

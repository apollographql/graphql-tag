module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.parse = parse;
	exports.parseValue = parseValue;
	exports.parseConstValue = parseConstValue;
	exports.parseType = parseType;
	exports.parseNamedType = parseNamedType;

	var _source = __webpack_require__(2);

	var _error = __webpack_require__(3);

	var _lexer = __webpack_require__(7);

	var _kinds = __webpack_require__(10);

	/**
	 * Given a GraphQL source, parses it into a Document.
	 * Throws GraphQLError if a syntax error is encountered.
	 */


	/**
	 * Configuration options to control parser behavior
	 */

	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	function parse(source, options) {
	  var sourceObj = source instanceof _source.Source ? source : new _source.Source(source);
	  var parser = makeParser(sourceObj, options || {});
	  return parseDocument(parser);
	}

	/**
	 * Given a string containing a GraphQL value, parse the AST for that value.
	 * Throws GraphQLError if a syntax error is encountered.
	 *
	 * This is useful within tools that operate upon GraphQL Values directly and
	 * in isolation of complete GraphQL documents.
	 */
	function parseValue(source, options) {
	  var sourceObj = source instanceof _source.Source ? source : new _source.Source(source);
	  var parser = makeParser(sourceObj, options || {});
	  return parseValueLiteral(parser, false);
	}

	/**
	 * Converts a name lex token into a name parse node.
	 */
	function parseName(parser) {
	  var token = expect(parser, _lexer.TokenKind.NAME);
	  return {
	    kind: _kinds.NAME,
	    value: token.value,
	    loc: loc(parser, token.start)
	  };
	}

	// Implements the parsing rules in the Document section.

	/**
	 * Document : Definition+
	 */
	function parseDocument(parser) {
	  var start = parser.token.start;

	  var definitions = [];
	  do {
	    definitions.push(parseDefinition(parser));
	  } while (!skip(parser, _lexer.TokenKind.EOF));

	  return {
	    kind: _kinds.DOCUMENT,
	    definitions: definitions,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * Definition :
	 *   - OperationDefinition
	 *   - FragmentDefinition
	 *   - TypeSystemDefinition
	 */
	function parseDefinition(parser) {
	  if (peek(parser, _lexer.TokenKind.BRACE_L)) {
	    return parseOperationDefinition(parser);
	  }

	  if (peek(parser, _lexer.TokenKind.NAME)) {
	    switch (parser.token.value) {
	      // Note: subscription is an experimental non-spec addition.
	      case 'query':
	      case 'mutation':
	      case 'subscription':
	        return parseOperationDefinition(parser);

	      case 'fragment':
	        return parseFragmentDefinition(parser);

	      // Note: the Type System IDL is an experimental non-spec addition.
	      case 'schema':
	      case 'scalar':
	      case 'type':
	      case 'interface':
	      case 'union':
	      case 'enum':
	      case 'input':
	      case 'extend':
	      case 'directive':
	        return parseTypeSystemDefinition(parser);
	    }
	  }

	  throw unexpected(parser);
	}

	// Implements the parsing rules in the Operations section.

	/**
	 * OperationDefinition :
	 *  - SelectionSet
	 *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
	 */
	function parseOperationDefinition(parser) {
	  var start = parser.token.start;
	  if (peek(parser, _lexer.TokenKind.BRACE_L)) {
	    return {
	      kind: _kinds.OPERATION_DEFINITION,
	      operation: 'query',
	      name: null,
	      variableDefinitions: null,
	      directives: [],
	      selectionSet: parseSelectionSet(parser),
	      loc: loc(parser, start)
	    };
	  }
	  var operation = parseOperationType(parser);
	  var name = void 0;
	  if (peek(parser, _lexer.TokenKind.NAME)) {
	    name = parseName(parser);
	  }
	  return {
	    kind: _kinds.OPERATION_DEFINITION,
	    operation: operation,
	    name: name,
	    variableDefinitions: parseVariableDefinitions(parser),
	    directives: parseDirectives(parser),
	    selectionSet: parseSelectionSet(parser),
	    loc: loc(parser, start)
	  };
	}

	/**
	 * OperationType : one of query mutation subscription
	 */
	function parseOperationType(parser) {
	  var operationToken = expect(parser, _lexer.TokenKind.NAME);
	  switch (operationToken.value) {
	    case 'query':
	      return 'query';
	    case 'mutation':
	      return 'mutation';
	    // Note: subscription is an experimental non-spec addition.
	    case 'subscription':
	      return 'subscription';
	  }

	  throw unexpected(parser, operationToken);
	}

	/**
	 * VariableDefinitions : ( VariableDefinition+ )
	 */
	function parseVariableDefinitions(parser) {
	  return peek(parser, _lexer.TokenKind.PAREN_L) ? many(parser, _lexer.TokenKind.PAREN_L, parseVariableDefinition, _lexer.TokenKind.PAREN_R) : [];
	}

	/**
	 * VariableDefinition : Variable : Type DefaultValue?
	 */
	function parseVariableDefinition(parser) {
	  var start = parser.token.start;
	  return {
	    kind: _kinds.VARIABLE_DEFINITION,
	    variable: parseVariable(parser),
	    type: (expect(parser, _lexer.TokenKind.COLON), parseType(parser)),
	    defaultValue: skip(parser, _lexer.TokenKind.EQUALS) ? parseValueLiteral(parser, true) : null,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * Variable : $ Name
	 */
	function parseVariable(parser) {
	  var start = parser.token.start;
	  expect(parser, _lexer.TokenKind.DOLLAR);
	  return {
	    kind: _kinds.VARIABLE,
	    name: parseName(parser),
	    loc: loc(parser, start)
	  };
	}

	/**
	 * SelectionSet : { Selection+ }
	 */
	function parseSelectionSet(parser) {
	  var start = parser.token.start;
	  return {
	    kind: _kinds.SELECTION_SET,
	    selections: many(parser, _lexer.TokenKind.BRACE_L, parseSelection, _lexer.TokenKind.BRACE_R),
	    loc: loc(parser, start)
	  };
	}

	/**
	 * Selection :
	 *   - Field
	 *   - FragmentSpread
	 *   - InlineFragment
	 */
	function parseSelection(parser) {
	  return peek(parser, _lexer.TokenKind.SPREAD) ? parseFragment(parser) : parseField(parser);
	}

	/**
	 * Field : Alias? Name Arguments? Directives? SelectionSet?
	 *
	 * Alias : Name :
	 */
	function parseField(parser) {
	  var start = parser.token.start;

	  var nameOrAlias = parseName(parser);
	  var alias = void 0;
	  var name = void 0;
	  if (skip(parser, _lexer.TokenKind.COLON)) {
	    alias = nameOrAlias;
	    name = parseName(parser);
	  } else {
	    alias = null;
	    name = nameOrAlias;
	  }

	  return {
	    kind: _kinds.FIELD,
	    alias: alias,
	    name: name,
	    arguments: parseArguments(parser),
	    directives: parseDirectives(parser),
	    selectionSet: peek(parser, _lexer.TokenKind.BRACE_L) ? parseSelectionSet(parser) : null,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * Arguments : ( Argument+ )
	 */
	function parseArguments(parser) {
	  return peek(parser, _lexer.TokenKind.PAREN_L) ? many(parser, _lexer.TokenKind.PAREN_L, parseArgument, _lexer.TokenKind.PAREN_R) : [];
	}

	/**
	 * Argument : Name : Value
	 */
	function parseArgument(parser) {
	  var start = parser.token.start;
	  return {
	    kind: _kinds.ARGUMENT,
	    name: parseName(parser),
	    value: (expect(parser, _lexer.TokenKind.COLON), parseValueLiteral(parser, false)),
	    loc: loc(parser, start)
	  };
	}

	// Implements the parsing rules in the Fragments section.

	/**
	 * Corresponds to both FragmentSpread and InlineFragment in the spec.
	 *
	 * FragmentSpread : ... FragmentName Directives?
	 *
	 * InlineFragment : ... TypeCondition? Directives? SelectionSet
	 */
	function parseFragment(parser) {
	  var start = parser.token.start;
	  expect(parser, _lexer.TokenKind.SPREAD);
	  if (peek(parser, _lexer.TokenKind.NAME) && parser.token.value !== 'on') {
	    return {
	      kind: _kinds.FRAGMENT_SPREAD,
	      name: parseFragmentName(parser),
	      directives: parseDirectives(parser),
	      loc: loc(parser, start)
	    };
	  }
	  var typeCondition = null;
	  if (parser.token.value === 'on') {
	    advance(parser);
	    typeCondition = parseNamedType(parser);
	  }
	  return {
	    kind: _kinds.INLINE_FRAGMENT,
	    typeCondition: typeCondition,
	    directives: parseDirectives(parser),
	    selectionSet: parseSelectionSet(parser),
	    loc: loc(parser, start)
	  };
	}

	/**
	 * FragmentDefinition :
	 *   - fragment FragmentName on TypeCondition Directives? SelectionSet
	 *
	 * TypeCondition : NamedType
	 */
	function parseFragmentDefinition(parser) {
	  var start = parser.token.start;
	  expectKeyword(parser, 'fragment');
	  return {
	    kind: _kinds.FRAGMENT_DEFINITION,
	    name: parseFragmentName(parser),
	    typeCondition: (expectKeyword(parser, 'on'), parseNamedType(parser)),
	    directives: parseDirectives(parser),
	    selectionSet: parseSelectionSet(parser),
	    loc: loc(parser, start)
	  };
	}

	/**
	 * FragmentName : Name but not `on`
	 */
	function parseFragmentName(parser) {
	  if (parser.token.value === 'on') {
	    throw unexpected(parser);
	  }
	  return parseName(parser);
	}

	// Implements the parsing rules in the Values section.

	/**
	 * Value[Const] :
	 *   - [~Const] Variable
	 *   - IntValue
	 *   - FloatValue
	 *   - StringValue
	 *   - BooleanValue
	 *   - EnumValue
	 *   - ListValue[?Const]
	 *   - ObjectValue[?Const]
	 *
	 * BooleanValue : one of `true` `false`
	 *
	 * EnumValue : Name but not `true`, `false` or `null`
	 */
	function parseValueLiteral(parser, isConst) {
	  var token = parser.token;
	  switch (token.kind) {
	    case _lexer.TokenKind.BRACKET_L:
	      return parseList(parser, isConst);
	    case _lexer.TokenKind.BRACE_L:
	      return parseObject(parser, isConst);
	    case _lexer.TokenKind.INT:
	      advance(parser);
	      return {
	        kind: _kinds.INT,
	        value: token.value,
	        loc: loc(parser, token.start)
	      };
	    case _lexer.TokenKind.FLOAT:
	      advance(parser);
	      return {
	        kind: _kinds.FLOAT,
	        value: token.value,
	        loc: loc(parser, token.start)
	      };
	    case _lexer.TokenKind.STRING:
	      advance(parser);
	      return {
	        kind: _kinds.STRING,
	        value: token.value,
	        loc: loc(parser, token.start)
	      };
	    case _lexer.TokenKind.NAME:
	      if (token.value === 'true' || token.value === 'false') {
	        advance(parser);
	        return {
	          kind: _kinds.BOOLEAN,
	          value: token.value === 'true',
	          loc: loc(parser, token.start)
	        };
	      } else if (token.value !== 'null') {
	        advance(parser);
	        return {
	          kind: _kinds.ENUM,
	          value: token.value,
	          loc: loc(parser, token.start)
	        };
	      }
	      break;
	    case _lexer.TokenKind.DOLLAR:
	      if (!isConst) {
	        return parseVariable(parser);
	      }
	      break;
	  }
	  throw unexpected(parser);
	}

	function parseConstValue(parser) {
	  return parseValueLiteral(parser, true);
	}

	function parseValueValue(parser) {
	  return parseValueLiteral(parser, false);
	}

	/**
	 * ListValue[Const] :
	 *   - [ ]
	 *   - [ Value[?Const]+ ]
	 */
	function parseList(parser, isConst) {
	  var start = parser.token.start;
	  var item = isConst ? parseConstValue : parseValueValue;
	  return {
	    kind: _kinds.LIST,
	    values: any(parser, _lexer.TokenKind.BRACKET_L, item, _lexer.TokenKind.BRACKET_R),
	    loc: loc(parser, start)
	  };
	}

	/**
	 * ObjectValue[Const] :
	 *   - { }
	 *   - { ObjectField[?Const]+ }
	 */
	function parseObject(parser, isConst) {
	  var start = parser.token.start;
	  expect(parser, _lexer.TokenKind.BRACE_L);
	  var fields = [];
	  while (!skip(parser, _lexer.TokenKind.BRACE_R)) {
	    fields.push(parseObjectField(parser, isConst));
	  }
	  return {
	    kind: _kinds.OBJECT,
	    fields: fields,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * ObjectField[Const] : Name : Value[?Const]
	 */
	function parseObjectField(parser, isConst) {
	  var start = parser.token.start;
	  return {
	    kind: _kinds.OBJECT_FIELD,
	    name: parseName(parser),
	    value: (expect(parser, _lexer.TokenKind.COLON), parseValueLiteral(parser, isConst)),
	    loc: loc(parser, start)
	  };
	}

	// Implements the parsing rules in the Directives section.

	/**
	 * Directives : Directive+
	 */
	function parseDirectives(parser) {
	  var directives = [];
	  while (peek(parser, _lexer.TokenKind.AT)) {
	    directives.push(parseDirective(parser));
	  }
	  return directives;
	}

	/**
	 * Directive : @ Name Arguments?
	 */
	function parseDirective(parser) {
	  var start = parser.token.start;
	  expect(parser, _lexer.TokenKind.AT);
	  return {
	    kind: _kinds.DIRECTIVE,
	    name: parseName(parser),
	    arguments: parseArguments(parser),
	    loc: loc(parser, start)
	  };
	}

	// Implements the parsing rules in the Types section.

	/**
	 * Type :
	 *   - NamedType
	 *   - ListType
	 *   - NonNullType
	 */
	function parseType(parser) {
	  var start = parser.token.start;
	  var type = void 0;
	  if (skip(parser, _lexer.TokenKind.BRACKET_L)) {
	    type = parseType(parser);
	    expect(parser, _lexer.TokenKind.BRACKET_R);
	    type = {
	      kind: _kinds.LIST_TYPE,
	      type: type,
	      loc: loc(parser, start)
	    };
	  } else {
	    type = parseNamedType(parser);
	  }
	  if (skip(parser, _lexer.TokenKind.BANG)) {
	    return {
	      kind: _kinds.NON_NULL_TYPE,
	      type: type,
	      loc: loc(parser, start)
	    };
	  }
	  return type;
	}

	/**
	 * NamedType : Name
	 */
	function parseNamedType(parser) {
	  var start = parser.token.start;
	  return {
	    kind: _kinds.NAMED_TYPE,
	    name: parseName(parser),
	    loc: loc(parser, start)
	  };
	}

	// Implements the parsing rules in the Type Definition section.

	/**
	 * TypeSystemDefinition :
	 *   - SchemaDefinition
	 *   - TypeDefinition
	 *   - TypeExtensionDefinition
	 *   - DirectiveDefinition
	 *
	 * TypeDefinition :
	 *   - ScalarTypeDefinition
	 *   - ObjectTypeDefinition
	 *   - InterfaceTypeDefinition
	 *   - UnionTypeDefinition
	 *   - EnumTypeDefinition
	 *   - InputObjectTypeDefinition
	 */
	function parseTypeSystemDefinition(parser) {
	  if (peek(parser, _lexer.TokenKind.NAME)) {
	    switch (parser.token.value) {
	      case 'schema':
	        return parseSchemaDefinition(parser);
	      case 'scalar':
	        return parseScalarTypeDefinition(parser);
	      case 'type':
	        return parseObjectTypeDefinition(parser);
	      case 'interface':
	        return parseInterfaceTypeDefinition(parser);
	      case 'union':
	        return parseUnionTypeDefinition(parser);
	      case 'enum':
	        return parseEnumTypeDefinition(parser);
	      case 'input':
	        return parseInputObjectTypeDefinition(parser);
	      case 'extend':
	        return parseTypeExtensionDefinition(parser);
	      case 'directive':
	        return parseDirectiveDefinition(parser);
	    }
	  }

	  throw unexpected(parser);
	}

	/**
	 * SchemaDefinition : schema Directives? { OperationTypeDefinition+ }
	 *
	 * OperationTypeDefinition : OperationType : NamedType
	 */
	function parseSchemaDefinition(parser) {
	  var start = parser.token.start;
	  expectKeyword(parser, 'schema');
	  var directives = parseDirectives(parser);
	  var operationTypes = many(parser, _lexer.TokenKind.BRACE_L, parseOperationTypeDefinition, _lexer.TokenKind.BRACE_R);
	  return {
	    kind: _kinds.SCHEMA_DEFINITION,
	    directives: directives,
	    operationTypes: operationTypes,
	    loc: loc(parser, start)
	  };
	}

	function parseOperationTypeDefinition(parser) {
	  var start = parser.token.start;
	  var operation = parseOperationType(parser);
	  expect(parser, _lexer.TokenKind.COLON);
	  var type = parseNamedType(parser);
	  return {
	    kind: _kinds.OPERATION_TYPE_DEFINITION,
	    operation: operation,
	    type: type,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * ScalarTypeDefinition : scalar Name Directives?
	 */
	function parseScalarTypeDefinition(parser) {
	  var start = parser.token.start;
	  expectKeyword(parser, 'scalar');
	  var name = parseName(parser);
	  var directives = parseDirectives(parser);
	  return {
	    kind: _kinds.SCALAR_TYPE_DEFINITION,
	    name: name,
	    directives: directives,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * ObjectTypeDefinition :
	 *   - type Name ImplementsInterfaces? Directives? { FieldDefinition+ }
	 */
	function parseObjectTypeDefinition(parser) {
	  var start = parser.token.start;
	  expectKeyword(parser, 'type');
	  var name = parseName(parser);
	  var interfaces = parseImplementsInterfaces(parser);
	  var directives = parseDirectives(parser);
	  var fields = any(parser, _lexer.TokenKind.BRACE_L, parseFieldDefinition, _lexer.TokenKind.BRACE_R);
	  return {
	    kind: _kinds.OBJECT_TYPE_DEFINITION,
	    name: name,
	    interfaces: interfaces,
	    directives: directives,
	    fields: fields,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * ImplementsInterfaces : implements NamedType+
	 */
	function parseImplementsInterfaces(parser) {
	  var types = [];
	  if (parser.token.value === 'implements') {
	    advance(parser);
	    do {
	      types.push(parseNamedType(parser));
	    } while (peek(parser, _lexer.TokenKind.NAME));
	  }
	  return types;
	}

	/**
	 * FieldDefinition : Name ArgumentsDefinition? : Type Directives?
	 */
	function parseFieldDefinition(parser) {
	  var start = parser.token.start;
	  var name = parseName(parser);
	  var args = parseArgumentDefs(parser);
	  expect(parser, _lexer.TokenKind.COLON);
	  var type = parseType(parser);
	  var directives = parseDirectives(parser);
	  return {
	    kind: _kinds.FIELD_DEFINITION,
	    name: name,
	    arguments: args,
	    type: type,
	    directives: directives,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * ArgumentsDefinition : ( InputValueDefinition+ )
	 */
	function parseArgumentDefs(parser) {
	  if (!peek(parser, _lexer.TokenKind.PAREN_L)) {
	    return [];
	  }
	  return many(parser, _lexer.TokenKind.PAREN_L, parseInputValueDef, _lexer.TokenKind.PAREN_R);
	}

	/**
	 * InputValueDefinition : Name : Type DefaultValue? Directives?
	 */
	function parseInputValueDef(parser) {
	  var start = parser.token.start;
	  var name = parseName(parser);
	  expect(parser, _lexer.TokenKind.COLON);
	  var type = parseType(parser);
	  var defaultValue = null;
	  if (skip(parser, _lexer.TokenKind.EQUALS)) {
	    defaultValue = parseConstValue(parser);
	  }
	  var directives = parseDirectives(parser);
	  return {
	    kind: _kinds.INPUT_VALUE_DEFINITION,
	    name: name,
	    type: type,
	    defaultValue: defaultValue,
	    directives: directives,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * InterfaceTypeDefinition : interface Name Directives? { FieldDefinition+ }
	 */
	function parseInterfaceTypeDefinition(parser) {
	  var start = parser.token.start;
	  expectKeyword(parser, 'interface');
	  var name = parseName(parser);
	  var directives = parseDirectives(parser);
	  var fields = any(parser, _lexer.TokenKind.BRACE_L, parseFieldDefinition, _lexer.TokenKind.BRACE_R);
	  return {
	    kind: _kinds.INTERFACE_TYPE_DEFINITION,
	    name: name,
	    directives: directives,
	    fields: fields,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * UnionTypeDefinition : union Name Directives? = UnionMembers
	 */
	function parseUnionTypeDefinition(parser) {
	  var start = parser.token.start;
	  expectKeyword(parser, 'union');
	  var name = parseName(parser);
	  var directives = parseDirectives(parser);
	  expect(parser, _lexer.TokenKind.EQUALS);
	  var types = parseUnionMembers(parser);
	  return {
	    kind: _kinds.UNION_TYPE_DEFINITION,
	    name: name,
	    directives: directives,
	    types: types,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * UnionMembers :
	 *   - NamedType
	 *   - UnionMembers | NamedType
	 */
	function parseUnionMembers(parser) {
	  var members = [];
	  do {
	    members.push(parseNamedType(parser));
	  } while (skip(parser, _lexer.TokenKind.PIPE));
	  return members;
	}

	/**
	 * EnumTypeDefinition : enum Name Directives? { EnumValueDefinition+ }
	 */
	function parseEnumTypeDefinition(parser) {
	  var start = parser.token.start;
	  expectKeyword(parser, 'enum');
	  var name = parseName(parser);
	  var directives = parseDirectives(parser);
	  var values = many(parser, _lexer.TokenKind.BRACE_L, parseEnumValueDefinition, _lexer.TokenKind.BRACE_R);
	  return {
	    kind: _kinds.ENUM_TYPE_DEFINITION,
	    name: name,
	    directives: directives,
	    values: values,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * EnumValueDefinition : EnumValue Directives?
	 *
	 * EnumValue : Name
	 */
	function parseEnumValueDefinition(parser) {
	  var start = parser.token.start;
	  var name = parseName(parser);
	  var directives = parseDirectives(parser);
	  return {
	    kind: _kinds.ENUM_VALUE_DEFINITION,
	    name: name,
	    directives: directives,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * InputObjectTypeDefinition : input Name Directives? { InputValueDefinition+ }
	 */
	function parseInputObjectTypeDefinition(parser) {
	  var start = parser.token.start;
	  expectKeyword(parser, 'input');
	  var name = parseName(parser);
	  var directives = parseDirectives(parser);
	  var fields = any(parser, _lexer.TokenKind.BRACE_L, parseInputValueDef, _lexer.TokenKind.BRACE_R);
	  return {
	    kind: _kinds.INPUT_OBJECT_TYPE_DEFINITION,
	    name: name,
	    directives: directives,
	    fields: fields,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * TypeExtensionDefinition : extend ObjectTypeDefinition
	 */
	function parseTypeExtensionDefinition(parser) {
	  var start = parser.token.start;
	  expectKeyword(parser, 'extend');
	  var definition = parseObjectTypeDefinition(parser);
	  return {
	    kind: _kinds.TYPE_EXTENSION_DEFINITION,
	    definition: definition,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * DirectiveDefinition :
	 *   - directive @ Name ArgumentsDefinition? on DirectiveLocations
	 */
	function parseDirectiveDefinition(parser) {
	  var start = parser.token.start;
	  expectKeyword(parser, 'directive');
	  expect(parser, _lexer.TokenKind.AT);
	  var name = parseName(parser);
	  var args = parseArgumentDefs(parser);
	  expectKeyword(parser, 'on');
	  var locations = parseDirectiveLocations(parser);
	  return {
	    kind: _kinds.DIRECTIVE_DEFINITION,
	    name: name,
	    arguments: args,
	    locations: locations,
	    loc: loc(parser, start)
	  };
	}

	/**
	 * DirectiveLocations :
	 *   - Name
	 *   - DirectiveLocations | Name
	 */
	function parseDirectiveLocations(parser) {
	  var locations = [];
	  do {
	    locations.push(parseName(parser));
	  } while (skip(parser, _lexer.TokenKind.PIPE));
	  return locations;
	}

	// Core parsing utility functions

	/**
	 * Returns the parser object that is used to store state throughout the
	 * process of parsing.
	 */
	function makeParser(source, options) {
	  var _lexToken = (0, _lexer.lex)(source);
	  return {
	    _lexToken: _lexToken,
	    source: source,
	    options: options,
	    prevEnd: 0,
	    token: _lexToken()
	  };
	}

	/**
	 * Returns a location object, used to identify the place in
	 * the source that created a given parsed object.
	 */
	function loc(parser, start) {
	  if (parser.options.noLocation) {
	    return null;
	  }
	  if (parser.options.noSource) {
	    return { start: start, end: parser.prevEnd };
	  }
	  return { start: start, end: parser.prevEnd, source: parser.source };
	}

	/**
	 * Moves the internal parser object to the next lexed token.
	 */
	function advance(parser) {
	  var prevEnd = parser.token.end;
	  parser.prevEnd = prevEnd;
	  parser.token = parser._lexToken(prevEnd);
	}

	/**
	 * Determines if the next token is of a given kind
	 */
	function peek(parser, kind) {
	  return parser.token.kind === kind;
	}

	/**
	 * If the next token is of the given kind, return true after advancing
	 * the parser. Otherwise, do not change the parser state and return false.
	 */
	function skip(parser, kind) {
	  var match = parser.token.kind === kind;
	  if (match) {
	    advance(parser);
	  }
	  return match;
	}

	/**
	 * If the next token is of the given kind, return that token after advancing
	 * the parser. Otherwise, do not change the parser state and throw an error.
	 */
	function expect(parser, kind) {
	  var token = parser.token;
	  if (token.kind === kind) {
	    advance(parser);
	    return token;
	  }
	  throw (0, _error.syntaxError)(parser.source, token.start, 'Expected ' + (0, _lexer.getTokenKindDesc)(kind) + ', found ' + (0, _lexer.getTokenDesc)(token));
	}

	/**
	 * If the next token is a keyword with the given value, return that token after
	 * advancing the parser. Otherwise, do not change the parser state and return
	 * false.
	 */
	function expectKeyword(parser, value) {
	  var token = parser.token;
	  if (token.kind === _lexer.TokenKind.NAME && token.value === value) {
	    advance(parser);
	    return token;
	  }
	  throw (0, _error.syntaxError)(parser.source, token.start, 'Expected "' + value + '", found ' + (0, _lexer.getTokenDesc)(token));
	}

	/**
	 * Helper function for creating an error when an unexpected lexed token
	 * is encountered.
	 */
	function unexpected(parser, atToken) {
	  var token = atToken || parser.token;
	  return (0, _error.syntaxError)(parser.source, token.start, 'Unexpected ' + (0, _lexer.getTokenDesc)(token));
	}

	/**
	 * Returns a possibly empty list of parse nodes, determined by
	 * the parseFn. This list begins with a lex token of openKind
	 * and ends with a lex token of closeKind. Advances the parser
	 * to the next lex token after the closing token.
	 */
	function any(parser, openKind, parseFn, closeKind) {
	  expect(parser, openKind);
	  var nodes = [];
	  while (!skip(parser, closeKind)) {
	    nodes.push(parseFn(parser));
	  }
	  return nodes;
	}

	/**
	 * Returns a non-empty list of parse nodes, determined by
	 * the parseFn. This list begins with a lex token of openKind
	 * and ends with a lex token of closeKind. Advances the parser
	 * to the next lex token after the closing token.
	 */
	function many(parser, openKind, parseFn, closeKind) {
	  expect(parser, openKind);
	  var nodes = [parseFn(parser)];
	  while (!skip(parser, closeKind)) {
	    nodes.push(parseFn(parser));
	  }
	  return nodes;
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	/**
	 * A representation of source input to GraphQL. The name is optional,
	 * but is mostly useful for clients who store GraphQL documents in
	 * source files; for example, if the GraphQL input is in a file Foo.graphql,
	 * it might be useful for name to be "Foo.graphql".
	 */
	var Source = exports.Source = function Source(body, name) {
	  _classCallCheck(this, Source);

	  this.body = body;
	  this.name = name || 'GraphQL';
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _GraphQLError = __webpack_require__(4);

	Object.defineProperty(exports, 'GraphQLError', {
	  enumerable: true,
	  get: function get() {
	    return _GraphQLError.GraphQLError;
	  }
	});

	var _syntaxError = __webpack_require__(11);

	Object.defineProperty(exports, 'syntaxError', {
	  enumerable: true,
	  get: function get() {
	    return _syntaxError.syntaxError;
	  }
	});

	var _locatedError = __webpack_require__(12);

	Object.defineProperty(exports, 'locatedError', {
	  enumerable: true,
	  get: function get() {
	    return _locatedError.locatedError;
	  }
	});

	var _formatError = __webpack_require__(13);

	Object.defineProperty(exports, 'formatError', {
	  enumerable: true,
	  get: function get() {
	    return _formatError.formatError;
	  }
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.GraphQLError = undefined;

	var _language = __webpack_require__(5);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	var GraphQLError = exports.GraphQLError = function (_Error) {
	  _inherits(GraphQLError, _Error);

	  function GraphQLError(message,
	  // A flow bug keeps us from declaring nodes as an array of Node
	  nodes, stack, source, positions, path, originalError) {
	    _classCallCheck(this, GraphQLError);

	    var _this = _possibleConstructorReturn(this, _Error.call(this, message));

	    Object.defineProperty(_this, 'message', {
	      value: message,
	      // By being enumerable, JSON.stringify will include `message` in the
	      // resulting output. This ensures that the simplist possible GraphQL
	      // service adheres to the spec.
	      enumerable: true,
	      // Note: you really shouldn't overwrite message, but it enables
	      // Error brand-checking.
	      writable: true
	    });

	    Object.defineProperty(_this, 'stack', {
	      value: stack || message,
	      // Note: stack should not really be writable, but some libraries (such
	      // as bluebird) use Error brand-checking which specifically looks to see
	      // if stack is a writable property.
	      writable: true
	    });

	    Object.defineProperty(_this, 'nodes', { value: nodes });

	    // Note: flow does not yet know about Object.defineProperty with `get`.
	    Object.defineProperty(_this, 'source', {
	      get: function get() {
	        if (source) {
	          return source;
	        }
	        if (nodes && nodes.length > 0) {
	          var node = nodes[0];
	          return node && node.loc && node.loc.source;
	        }
	      }
	    });

	    Object.defineProperty(_this, 'positions', {
	      get: function get() {
	        if (positions) {
	          return positions;
	        }
	        if (nodes) {
	          var nodePositions = nodes.map(function (node) {
	            return node.loc && node.loc.start;
	          });
	          if (nodePositions.some(function (p) {
	            return p;
	          })) {
	            return nodePositions;
	          }
	        }
	      }
	    });

	    Object.defineProperty(_this, 'locations', {
	      get: function get() {
	        var _positions = this.positions;
	        var _source = this.source;
	        if (_positions && _positions.length > 0 && _source) {
	          return _positions.map(function (pos) {
	            return (0, _language.getLocation)(_source, pos);
	          });
	        }
	      },

	      // By being enumerable, JSON.stringify will include `locations` in the
	      // resulting output. This ensures that the simplist possible GraphQL
	      // service adheres to the spec.
	      enumerable: true
	    });

	    Object.defineProperty(_this, 'path', {
	      value: path,
	      // By being enumerable, JSON.stringify will include `path` in the
	      // resulting output. This ensures that the simplist possible GraphQL
	      // service adheres to the spec.
	      enumerable: true
	    });

	    Object.defineProperty(_this, 'originalError', {
	      value: originalError
	    });
	    return _this;
	  }

	  return GraphQLError;
	}(Error);

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.BREAK = exports.visitWithTypeInfo = exports.visitInParallel = exports.visit = exports.Source = exports.print = exports.parseValue = exports.parse = exports.lex = exports.Kind = exports.getLocation = undefined;

	var _location = __webpack_require__(6);

	Object.defineProperty(exports, 'getLocation', {
	  enumerable: true,
	  get: function get() {
	    return _location.getLocation;
	  }
	});

	var _lexer = __webpack_require__(7);

	Object.defineProperty(exports, 'lex', {
	  enumerable: true,
	  get: function get() {
	    return _lexer.lex;
	  }
	});

	var _parser = __webpack_require__(1);

	Object.defineProperty(exports, 'parse', {
	  enumerable: true,
	  get: function get() {
	    return _parser.parse;
	  }
	});
	Object.defineProperty(exports, 'parseValue', {
	  enumerable: true,
	  get: function get() {
	    return _parser.parseValue;
	  }
	});

	var _printer = __webpack_require__(8);

	Object.defineProperty(exports, 'print', {
	  enumerable: true,
	  get: function get() {
	    return _printer.print;
	  }
	});

	var _source = __webpack_require__(2);

	Object.defineProperty(exports, 'Source', {
	  enumerable: true,
	  get: function get() {
	    return _source.Source;
	  }
	});

	var _visitor = __webpack_require__(9);

	Object.defineProperty(exports, 'visit', {
	  enumerable: true,
	  get: function get() {
	    return _visitor.visit;
	  }
	});
	Object.defineProperty(exports, 'visitInParallel', {
	  enumerable: true,
	  get: function get() {
	    return _visitor.visitInParallel;
	  }
	});
	Object.defineProperty(exports, 'visitWithTypeInfo', {
	  enumerable: true,
	  get: function get() {
	    return _visitor.visitWithTypeInfo;
	  }
	});
	Object.defineProperty(exports, 'BREAK', {
	  enumerable: true,
	  get: function get() {
	    return _visitor.BREAK;
	  }
	});

	var _kinds = __webpack_require__(10);

	var Kind = _interopRequireWildcard(_kinds);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	exports.Kind = Kind;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getLocation = getLocation;


	/**
	 * Takes a Source and a UTF-8 character offset, and returns the corresponding
	 * line and column as a SourceLocation.
	 */

	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	function getLocation(source, position) {
	  var lineRegexp = /\r\n|[\n\r]/g;
	  var line = 1;
	  var column = position + 1;
	  var match = void 0;
	  while ((match = lineRegexp.exec(source.body)) && match.index < position) {
	    line += 1;
	    column = position + 1 - (match.index + match[0].length);
	  }
	  return { line: line, column: column };
	}

	/**
	 * Represents a location in a Source.
	 */

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.TokenKind = undefined;
	exports.lex = lex;
	exports.getTokenDesc = getTokenDesc;
	exports.getTokenKindDesc = getTokenKindDesc;

	var _error = __webpack_require__(3);

	/**
	 * Given a Source object, this returns a Lexer for that source.
	 * A Lexer is a function that acts like a generator in that every time
	 * it is called, it returns the next token in the Source. Assuming the
	 * source lexes, the final Token emitted by the lexer will be of kind
	 * EOF, after which the lexer will repeatedly return EOF tokens whenever
	 * called.
	 *
	 * The argument to the lexer function is optional, and can be used to
	 * rewind or fast forward the lexer to a new position in the source.
	 */


	/**
	 * A representation of a lexed Token. Value only appears for non-punctuation
	 * tokens: NAME, INT, FLOAT, and STRING.
	 */
	/*  /
	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	function lex(source) {
	  var prevPosition = 0;
	  return function nextToken(resetPosition) {
	    var token = readToken(source, resetPosition === undefined ? prevPosition : resetPosition);
	    prevPosition = token.end;
	    return token;
	  };
	}

	/**
	 * An enum describing the different kinds of tokens that the lexer emits.
	 */
	var TokenKind = exports.TokenKind = {
	  EOF: 1,
	  BANG: 2,
	  DOLLAR: 3,
	  PAREN_L: 4,
	  PAREN_R: 5,
	  SPREAD: 6,
	  COLON: 7,
	  EQUALS: 8,
	  AT: 9,
	  BRACKET_L: 10,
	  BRACKET_R: 11,
	  BRACE_L: 12,
	  PIPE: 13,
	  BRACE_R: 14,
	  NAME: 15,
	  INT: 16,
	  FLOAT: 17,
	  STRING: 18
	};

	/**
	 * A helper function to describe a token as a string for debugging
	 */
	function getTokenDesc(token) {
	  var value = token.value;
	  return value ? getTokenKindDesc(token.kind) + ' "' + value + '"' : getTokenKindDesc(token.kind);
	}

	/**
	 * A helper function to describe a token kind as a string for debugging
	 */
	function getTokenKindDesc(kind) {
	  return tokenDescription[kind];
	}

	var tokenDescription = {};
	tokenDescription[TokenKind.EOF] = 'EOF';
	tokenDescription[TokenKind.BANG] = '!';
	tokenDescription[TokenKind.DOLLAR] = '$';
	tokenDescription[TokenKind.PAREN_L] = '(';
	tokenDescription[TokenKind.PAREN_R] = ')';
	tokenDescription[TokenKind.SPREAD] = '...';
	tokenDescription[TokenKind.COLON] = ':';
	tokenDescription[TokenKind.EQUALS] = '=';
	tokenDescription[TokenKind.AT] = '@';
	tokenDescription[TokenKind.BRACKET_L] = '[';
	tokenDescription[TokenKind.BRACKET_R] = ']';
	tokenDescription[TokenKind.BRACE_L] = '{';
	tokenDescription[TokenKind.PIPE] = '|';
	tokenDescription[TokenKind.BRACE_R] = '}';
	tokenDescription[TokenKind.NAME] = 'Name';
	tokenDescription[TokenKind.INT] = 'Int';
	tokenDescription[TokenKind.FLOAT] = 'Float';
	tokenDescription[TokenKind.STRING] = 'String';

	var charCodeAt = String.prototype.charCodeAt;
	var slice = String.prototype.slice;

	/**
	 * Helper function for constructing the Token object.
	 */
	function makeToken(kind, start, end, value) {
	  return { kind: kind, start: start, end: end, value: value };
	}

	function printCharCode(code) {
	  return (
	    // NaN/undefined represents access beyond the end of the file.
	    isNaN(code) ? '<EOF>' :
	    // Trust JSON for ASCII.
	    code < 0x007F ? JSON.stringify(String.fromCharCode(code)) :
	    // Otherwise print the escaped form.
	    '"\\u' + ('00' + code.toString(16).toUpperCase()).slice(-4) + '"'
	  );
	}

	/**
	 * Gets the next token from the source starting at the given position.
	 *
	 * This skips over whitespace and comments until it finds the next lexable
	 * token, then lexes punctuators immediately or calls the appropriate helper
	 * function for more complicated tokens.
	 */
	function readToken(source, fromPosition) {
	  var body = source.body;
	  var bodyLength = body.length;

	  var position = positionAfterWhitespace(body, fromPosition);

	  if (position >= bodyLength) {
	    return makeToken(TokenKind.EOF, position, position);
	  }

	  var code = charCodeAt.call(body, position);

	  // SourceCharacter
	  if (code < 0x0020 && code !== 0x0009 && code !== 0x000A && code !== 0x000D) {
	    throw (0, _error.syntaxError)(source, position, 'Invalid character ' + printCharCode(code) + '.');
	  }

	  switch (code) {
	    // !
	    case 33:
	      return makeToken(TokenKind.BANG, position, position + 1);
	    // $
	    case 36:
	      return makeToken(TokenKind.DOLLAR, position, position + 1);
	    // (
	    case 40:
	      return makeToken(TokenKind.PAREN_L, position, position + 1);
	    // )
	    case 41:
	      return makeToken(TokenKind.PAREN_R, position, position + 1);
	    // .
	    case 46:
	      if (charCodeAt.call(body, position + 1) === 46 && charCodeAt.call(body, position + 2) === 46) {
	        return makeToken(TokenKind.SPREAD, position, position + 3);
	      }
	      break;
	    // :
	    case 58:
	      return makeToken(TokenKind.COLON, position, position + 1);
	    // =
	    case 61:
	      return makeToken(TokenKind.EQUALS, position, position + 1);
	    // @
	    case 64:
	      return makeToken(TokenKind.AT, position, position + 1);
	    // [
	    case 91:
	      return makeToken(TokenKind.BRACKET_L, position, position + 1);
	    // ]
	    case 93:
	      return makeToken(TokenKind.BRACKET_R, position, position + 1);
	    // {
	    case 123:
	      return makeToken(TokenKind.BRACE_L, position, position + 1);
	    // |
	    case 124:
	      return makeToken(TokenKind.PIPE, position, position + 1);
	    // }
	    case 125:
	      return makeToken(TokenKind.BRACE_R, position, position + 1);
	    // A-Z _ a-z
	    case 65:case 66:case 67:case 68:case 69:case 70:case 71:case 72:
	    case 73:case 74:case 75:case 76:case 77:case 78:case 79:case 80:
	    case 81:case 82:case 83:case 84:case 85:case 86:case 87:case 88:
	    case 89:case 90:
	    case 95:
	    case 97:case 98:case 99:case 100:case 101:case 102:case 103:case 104:
	    case 105:case 106:case 107:case 108:case 109:case 110:case 111:
	    case 112:case 113:case 114:case 115:case 116:case 117:case 118:
	    case 119:case 120:case 121:case 122:
	      return readName(source, position);
	    // - 0-9
	    case 45:
	    case 48:case 49:case 50:case 51:case 52:
	    case 53:case 54:case 55:case 56:case 57:
	      return readNumber(source, position, code);
	    // "
	    case 34:
	      return readString(source, position);
	  }

	  throw (0, _error.syntaxError)(source, position, 'Unexpected character ' + printCharCode(code) + '.');
	}

	/**
	 * Reads from body starting at startPosition until it finds a non-whitespace
	 * or commented character, then returns the position of that character for
	 * lexing.
	 */
	function positionAfterWhitespace(body, startPosition) {
	  var bodyLength = body.length;
	  var position = startPosition;
	  while (position < bodyLength) {
	    var code = charCodeAt.call(body, position);
	    // Skip Ignored
	    if (
	    // BOM
	    code === 0xFEFF ||
	    // White Space
	    code === 0x0009 || // tab
	    code === 0x0020 || // space
	    // Line Terminator
	    code === 0x000A || // new line
	    code === 0x000D || // carriage return
	    // Comma
	    code === 0x002C) {
	      ++position;
	      // Skip comments
	    } else if (code === 35) {
	      // #
	      ++position;
	      while (position < bodyLength && (code = charCodeAt.call(body, position)) !== null && (
	      // SourceCharacter but not LineTerminator
	      code > 0x001F || code === 0x0009) && code !== 0x000A && code !== 0x000D) {
	        ++position;
	      }
	    } else {
	      break;
	    }
	  }
	  return position;
	}

	/**
	 * Reads a number token from the source file, either a float
	 * or an int depending on whether a decimal point appears.
	 *
	 * Int:   -?(0|[1-9][0-9]*)
	 * Float: -?(0|[1-9][0-9]*)(\.[0-9]+)?((E|e)(+|-)?[0-9]+)?
	 */
	function readNumber(source, start, firstCode) {
	  var body = source.body;
	  var code = firstCode;
	  var position = start;
	  var isFloat = false;

	  if (code === 45) {
	    // -
	    code = charCodeAt.call(body, ++position);
	  }

	  if (code === 48) {
	    // 0
	    code = charCodeAt.call(body, ++position);
	    if (code >= 48 && code <= 57) {
	      throw (0, _error.syntaxError)(source, position, 'Invalid number, unexpected digit after 0: ' + printCharCode(code) + '.');
	    }
	  } else {
	    position = readDigits(source, position, code);
	    code = charCodeAt.call(body, position);
	  }

	  if (code === 46) {
	    // .
	    isFloat = true;

	    code = charCodeAt.call(body, ++position);
	    position = readDigits(source, position, code);
	    code = charCodeAt.call(body, position);
	  }

	  if (code === 69 || code === 101) {
	    // E e
	    isFloat = true;

	    code = charCodeAt.call(body, ++position);
	    if (code === 43 || code === 45) {
	      // + -
	      code = charCodeAt.call(body, ++position);
	    }
	    position = readDigits(source, position, code);
	  }

	  return makeToken(isFloat ? TokenKind.FLOAT : TokenKind.INT, start, position, slice.call(body, start, position));
	}

	/**
	 * Returns the new position in the source after reading digits.
	 */
	function readDigits(source, start, firstCode) {
	  var body = source.body;
	  var position = start;
	  var code = firstCode;
	  if (code >= 48 && code <= 57) {
	    // 0 - 9
	    do {
	      code = charCodeAt.call(body, ++position);
	    } while (code >= 48 && code <= 57); // 0 - 9
	    return position;
	  }
	  throw (0, _error.syntaxError)(source, position, 'Invalid number, expected digit but got: ' + printCharCode(code) + '.');
	}

	/**
	 * Reads a string token from the source file.
	 *
	 * "([^"\\\u000A\u000D]|(\\(u[0-9a-fA-F]{4}|["\\/bfnrt])))*"
	 */
	function readString(source, start) {
	  var body = source.body;
	  var position = start + 1;
	  var chunkStart = position;
	  var code = 0;
	  var value = '';

	  while (position < body.length && (code = charCodeAt.call(body, position)) !== null &&
	  // not LineTerminator
	  code !== 0x000A && code !== 0x000D &&
	  // not Quote (")
	  code !== 34) {
	    // SourceCharacter
	    if (code < 0x0020 && code !== 0x0009) {
	      throw (0, _error.syntaxError)(source, position, 'Invalid character within String: ' + printCharCode(code) + '.');
	    }

	    ++position;
	    if (code === 92) {
	      // \
	      value += slice.call(body, chunkStart, position - 1);
	      code = charCodeAt.call(body, position);
	      switch (code) {
	        case 34:
	          value += '"';break;
	        case 47:
	          value += '\/';break;
	        case 92:
	          value += '\\';break;
	        case 98:
	          value += '\b';break;
	        case 102:
	          value += '\f';break;
	        case 110:
	          value += '\n';break;
	        case 114:
	          value += '\r';break;
	        case 116:
	          value += '\t';break;
	        case 117:
	          // u
	          var charCode = uniCharCode(charCodeAt.call(body, position + 1), charCodeAt.call(body, position + 2), charCodeAt.call(body, position + 3), charCodeAt.call(body, position + 4));
	          if (charCode < 0) {
	            throw (0, _error.syntaxError)(source, position, 'Invalid character escape sequence: ' + ('\\u' + body.slice(position + 1, position + 5) + '.'));
	          }
	          value += String.fromCharCode(charCode);
	          position += 4;
	          break;
	        default:
	          throw (0, _error.syntaxError)(source, position, 'Invalid character escape sequence: \\' + String.fromCharCode(code) + '.');
	      }
	      ++position;
	      chunkStart = position;
	    }
	  }

	  if (code !== 34) {
	    // quote (")
	    throw (0, _error.syntaxError)(source, position, 'Unterminated string.');
	  }

	  value += slice.call(body, chunkStart, position);
	  return makeToken(TokenKind.STRING, start, position + 1, value);
	}

	/**
	 * Converts four hexidecimal chars to the integer that the
	 * string represents. For example, uniCharCode('0','0','0','f')
	 * will return 15, and uniCharCode('0','0','f','f') returns 255.
	 *
	 * Returns a negative number on error, if a char was invalid.
	 *
	 * This is implemented by noting that char2hex() returns -1 on error,
	 * which means the result of ORing the char2hex() will also be negative.
	 */
	function uniCharCode(a, b, c, d) {
	  return char2hex(a) << 12 | char2hex(b) << 8 | char2hex(c) << 4 | char2hex(d);
	}

	/**
	 * Converts a hex character to its integer value.
	 * '0' becomes 0, '9' becomes 9
	 * 'A' becomes 10, 'F' becomes 15
	 * 'a' becomes 10, 'f' becomes 15
	 *
	 * Returns -1 on error.
	 */
	function char2hex(a) {
	  return a >= 48 && a <= 57 ? a - 48 : // 0-9
	  a >= 65 && a <= 70 ? a - 55 : // A-F
	  a >= 97 && a <= 102 ? a - 87 : // a-f
	  -1;
	}

	/**
	 * Reads an alphanumeric + underscore name from the source.
	 *
	 * [_A-Za-z][_0-9A-Za-z]*
	 */
	function readName(source, position) {
	  var body = source.body;
	  var bodyLength = body.length;
	  var end = position + 1;
	  var code = 0;
	  while (end !== bodyLength && (code = charCodeAt.call(body, end)) !== null && (code === 95 || // _
	  code >= 48 && code <= 57 || // 0-9
	  code >= 65 && code <= 90 || // A-Z
	  code >= 97 && code <= 122 // a-z
	  )) {
	    ++end;
	  }
	  return makeToken(TokenKind.NAME, position, end, slice.call(body, position, end));
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.print = print;

	var _visitor = __webpack_require__(9);

	/**
	 * Converts an AST into a string, using one set of reasonable
	 * formatting rules.
	 */
	function print(ast) {
	  return (0, _visitor.visit)(ast, { leave: printDocASTReducer });
	} /**
	   *  Copyright (c) 2015, Facebook, Inc.
	   *  All rights reserved.
	   *
	   *  This source code is licensed under the BSD-style license found in the
	   *  LICENSE file in the root directory of this source tree. An additional grant
	   *  of patent rights can be found in the PATENTS file in the same directory.
	   */

	var printDocASTReducer = {
	  Name: function Name(node) {
	    return node.value;
	  },
	  Variable: function Variable(node) {
	    return '$' + node.name;
	  },

	  // Document

	  Document: function Document(node) {
	    return join(node.definitions, '\n\n') + '\n';
	  },

	  OperationDefinition: function OperationDefinition(node) {
	    var op = node.operation;
	    var name = node.name;
	    var varDefs = wrap('(', join(node.variableDefinitions, ', '), ')');
	    var directives = join(node.directives, ' ');
	    var selectionSet = node.selectionSet;
	    // Anonymous queries with no directives or variable definitions can use
	    // the query short form.
	    return !name && !directives && !varDefs && op === 'query' ? selectionSet : join([op, join([name, varDefs]), directives, selectionSet], ' ');
	  },


	  VariableDefinition: function VariableDefinition(_ref) {
	    var variable = _ref.variable;
	    var type = _ref.type;
	    var defaultValue = _ref.defaultValue;
	    return variable + ': ' + type + wrap(' = ', defaultValue);
	  },

	  SelectionSet: function SelectionSet(_ref2) {
	    var selections = _ref2.selections;
	    return block(selections);
	  },

	  Field: function Field(_ref3) {
	    var alias = _ref3.alias;
	    var name = _ref3.name;
	    var args = _ref3.arguments;
	    var directives = _ref3.directives;
	    var selectionSet = _ref3.selectionSet;
	    return join([wrap('', alias, ': ') + name + wrap('(', join(args, ', '), ')'), join(directives, ' '), selectionSet], ' ');
	  },

	  Argument: function Argument(_ref4) {
	    var name = _ref4.name;
	    var value = _ref4.value;
	    return name + ': ' + value;
	  },

	  // Fragments

	  FragmentSpread: function FragmentSpread(_ref5) {
	    var name = _ref5.name;
	    var directives = _ref5.directives;
	    return '...' + name + wrap(' ', join(directives, ' '));
	  },

	  InlineFragment: function InlineFragment(_ref6) {
	    var typeCondition = _ref6.typeCondition;
	    var directives = _ref6.directives;
	    var selectionSet = _ref6.selectionSet;
	    return join(['...', wrap('on ', typeCondition), join(directives, ' '), selectionSet], ' ');
	  },

	  FragmentDefinition: function FragmentDefinition(_ref7) {
	    var name = _ref7.name;
	    var typeCondition = _ref7.typeCondition;
	    var directives = _ref7.directives;
	    var selectionSet = _ref7.selectionSet;
	    return 'fragment ' + name + ' on ' + typeCondition + ' ' + wrap('', join(directives, ' '), ' ') + selectionSet;
	  },

	  // Value

	  IntValue: function IntValue(_ref8) {
	    var value = _ref8.value;
	    return value;
	  },
	  FloatValue: function FloatValue(_ref9) {
	    var value = _ref9.value;
	    return value;
	  },
	  StringValue: function StringValue(_ref10) {
	    var value = _ref10.value;
	    return JSON.stringify(value);
	  },
	  BooleanValue: function BooleanValue(_ref11) {
	    var value = _ref11.value;
	    return JSON.stringify(value);
	  },
	  EnumValue: function EnumValue(_ref12) {
	    var value = _ref12.value;
	    return value;
	  },
	  ListValue: function ListValue(_ref13) {
	    var values = _ref13.values;
	    return '[' + join(values, ', ') + ']';
	  },
	  ObjectValue: function ObjectValue(_ref14) {
	    var fields = _ref14.fields;
	    return '{' + join(fields, ', ') + '}';
	  },
	  ObjectField: function ObjectField(_ref15) {
	    var name = _ref15.name;
	    var value = _ref15.value;
	    return name + ': ' + value;
	  },

	  // Directive

	  Directive: function Directive(_ref16) {
	    var name = _ref16.name;
	    var args = _ref16.arguments;
	    return '@' + name + wrap('(', join(args, ', '), ')');
	  },

	  // Type

	  NamedType: function NamedType(_ref17) {
	    var name = _ref17.name;
	    return name;
	  },
	  ListType: function ListType(_ref18) {
	    var type = _ref18.type;
	    return '[' + type + ']';
	  },
	  NonNullType: function NonNullType(_ref19) {
	    var type = _ref19.type;
	    return type + '!';
	  },

	  // Type System Definitions

	  SchemaDefinition: function SchemaDefinition(_ref20) {
	    var directives = _ref20.directives;
	    var operationTypes = _ref20.operationTypes;
	    return join(['schema', join(directives, ' '), block(operationTypes)], ' ');
	  },

	  OperationTypeDefinition: function OperationTypeDefinition(_ref21) {
	    var operation = _ref21.operation;
	    var type = _ref21.type;
	    return operation + ': ' + type;
	  },

	  ScalarTypeDefinition: function ScalarTypeDefinition(_ref22) {
	    var name = _ref22.name;
	    var directives = _ref22.directives;
	    return join(['scalar', name, join(directives, ' ')], ' ');
	  },

	  ObjectTypeDefinition: function ObjectTypeDefinition(_ref23) {
	    var name = _ref23.name;
	    var interfaces = _ref23.interfaces;
	    var directives = _ref23.directives;
	    var fields = _ref23.fields;
	    return join(['type', name, wrap('implements ', join(interfaces, ', ')), join(directives, ' '), block(fields)], ' ');
	  },

	  FieldDefinition: function FieldDefinition(_ref24) {
	    var name = _ref24.name;
	    var args = _ref24.arguments;
	    var type = _ref24.type;
	    var directives = _ref24.directives;
	    return name + wrap('(', join(args, ', '), ')') + ': ' + type + wrap(' ', join(directives, ' '));
	  },

	  InputValueDefinition: function InputValueDefinition(_ref25) {
	    var name = _ref25.name;
	    var type = _ref25.type;
	    var defaultValue = _ref25.defaultValue;
	    var directives = _ref25.directives;
	    return join([name + ': ' + type, wrap('= ', defaultValue), join(directives, ' ')], ' ');
	  },

	  InterfaceTypeDefinition: function InterfaceTypeDefinition(_ref26) {
	    var name = _ref26.name;
	    var directives = _ref26.directives;
	    var fields = _ref26.fields;
	    return join(['interface', name, join(directives, ' '), block(fields)], ' ');
	  },

	  UnionTypeDefinition: function UnionTypeDefinition(_ref27) {
	    var name = _ref27.name;
	    var directives = _ref27.directives;
	    var types = _ref27.types;
	    return join(['union', name, join(directives, ' '), '= ' + join(types, ' | ')], ' ');
	  },

	  EnumTypeDefinition: function EnumTypeDefinition(_ref28) {
	    var name = _ref28.name;
	    var directives = _ref28.directives;
	    var values = _ref28.values;
	    return join(['enum', name, join(directives, ' '), block(values)], ' ');
	  },

	  EnumValueDefinition: function EnumValueDefinition(_ref29) {
	    var name = _ref29.name;
	    var directives = _ref29.directives;
	    return join([name, join(directives, ' ')], ' ');
	  },

	  InputObjectTypeDefinition: function InputObjectTypeDefinition(_ref30) {
	    var name = _ref30.name;
	    var directives = _ref30.directives;
	    var fields = _ref30.fields;
	    return join(['input', name, join(directives, ' '), block(fields)], ' ');
	  },

	  TypeExtensionDefinition: function TypeExtensionDefinition(_ref31) {
	    var definition = _ref31.definition;
	    return 'extend ' + definition;
	  },

	  DirectiveDefinition: function DirectiveDefinition(_ref32) {
	    var name = _ref32.name;
	    var args = _ref32.arguments;
	    var locations = _ref32.locations;
	    return 'directive @' + name + wrap('(', join(args, ', '), ')') + ' on ' + join(locations, ' | ');
	  }
	};

	/**
	 * Given maybeArray, print an empty string if it is null or empty, otherwise
	 * print all items together separated by separator if provided
	 */
	function join(maybeArray, separator) {
	  return maybeArray ? maybeArray.filter(function (x) {
	    return x;
	  }).join(separator || '') : '';
	}

	/**
	 * Given array, print each item on its own line, wrapped in an
	 * indented "{ }" block.
	 */
	function block(array) {
	  return array && array.length !== 0 ? indent('{\n' + join(array, '\n')) + '\n}' : '{}';
	}

	/**
	 * If maybeString is not null or empty, then wrap with start and end, otherwise
	 * print an empty string.
	 */
	function wrap(start, maybeString, end) {
	  return maybeString ? start + maybeString + (end || '') : '';
	}

	function indent(maybeString) {
	  return maybeString && maybeString.replace(/\n/g, '\n  ');
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.visit = visit;
	exports.visitInParallel = visitInParallel;
	exports.visitWithTypeInfo = visitWithTypeInfo;
	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	var QueryDocumentKeys = exports.QueryDocumentKeys = {
	  Name: [],

	  Document: ['definitions'],
	  OperationDefinition: ['name', 'variableDefinitions', 'directives', 'selectionSet'],
	  VariableDefinition: ['variable', 'type', 'defaultValue'],
	  Variable: ['name'],
	  SelectionSet: ['selections'],
	  Field: ['alias', 'name', 'arguments', 'directives', 'selectionSet'],
	  Argument: ['name', 'value'],

	  FragmentSpread: ['name', 'directives'],
	  InlineFragment: ['typeCondition', 'directives', 'selectionSet'],
	  FragmentDefinition: ['name', 'typeCondition', 'directives', 'selectionSet'],

	  IntValue: [],
	  FloatValue: [],
	  StringValue: [],
	  BooleanValue: [],
	  EnumValue: [],
	  ListValue: ['values'],
	  ObjectValue: ['fields'],
	  ObjectField: ['name', 'value'],

	  Directive: ['name', 'arguments'],

	  NamedType: ['name'],
	  ListType: ['type'],
	  NonNullType: ['type'],

	  SchemaDefinition: ['directives', 'operationTypes'],
	  OperationTypeDefinition: ['type'],

	  ScalarTypeDefinition: ['name', 'directives'],
	  ObjectTypeDefinition: ['name', 'interfaces', 'directives', 'fields'],
	  FieldDefinition: ['name', 'arguments', 'type', 'directives'],
	  InputValueDefinition: ['name', 'type', 'defaultValue', 'directives'],
	  InterfaceTypeDefinition: ['name', 'directives', 'fields'],
	  UnionTypeDefinition: ['name', 'directives', 'types'],
	  EnumTypeDefinition: ['name', 'directives', 'values'],
	  EnumValueDefinition: ['name', 'directives'],
	  InputObjectTypeDefinition: ['name', 'directives', 'fields'],

	  TypeExtensionDefinition: ['definition'],

	  DirectiveDefinition: ['name', 'arguments', 'locations']
	};

	var BREAK = exports.BREAK = {};

	/**
	 * visit() will walk through an AST using a depth first traversal, calling
	 * the visitor's enter function at each node in the traversal, and calling the
	 * leave function after visiting that node and all of its child nodes.
	 *
	 * By returning different values from the enter and leave functions, the
	 * behavior of the visitor can be altered, including skipping over a sub-tree of
	 * the AST (by returning false), editing the AST by returning a value or null
	 * to remove the value, or to stop the whole traversal by returning BREAK.
	 *
	 * When using visit() to edit an AST, the original AST will not be modified, and
	 * a new version of the AST with the changes applied will be returned from the
	 * visit function.
	 *
	 *     const editedAST = visit(ast, {
	 *       enter(node, key, parent, path, ancestors) {
	 *         // @return
	 *         //   undefined: no action
	 *         //   false: skip visiting this node
	 *         //   visitor.BREAK: stop visiting altogether
	 *         //   null: delete this node
	 *         //   any value: replace this node with the returned value
	 *       },
	 *       leave(node, key, parent, path, ancestors) {
	 *         // @return
	 *         //   undefined: no action
	 *         //   false: no action
	 *         //   visitor.BREAK: stop visiting altogether
	 *         //   null: delete this node
	 *         //   any value: replace this node with the returned value
	 *       }
	 *     });
	 *
	 * Alternatively to providing enter() and leave() functions, a visitor can
	 * instead provide functions named the same as the kinds of AST nodes, or
	 * enter/leave visitors at a named key, leading to four permutations of
	 * visitor API:
	 *
	 * 1) Named visitors triggered when entering a node a specific kind.
	 *
	 *     visit(ast, {
	 *       Kind(node) {
	 *         // enter the "Kind" node
	 *       }
	 *     })
	 *
	 * 2) Named visitors that trigger upon entering and leaving a node of
	 *    a specific kind.
	 *
	 *     visit(ast, {
	 *       Kind: {
	 *         enter(node) {
	 *           // enter the "Kind" node
	 *         }
	 *         leave(node) {
	 *           // leave the "Kind" node
	 *         }
	 *       }
	 *     })
	 *
	 * 3) Generic visitors that trigger upon entering and leaving any node.
	 *
	 *     visit(ast, {
	 *       enter(node) {
	 *         // enter any node
	 *       },
	 *       leave(node) {
	 *         // leave any node
	 *       }
	 *     })
	 *
	 * 4) Parallel visitors for entering and leaving nodes of a specific kind.
	 *
	 *     visit(ast, {
	 *       enter: {
	 *         Kind(node) {
	 *           // enter the "Kind" node
	 *         }
	 *       },
	 *       leave: {
	 *         Kind(node) {
	 *           // leave the "Kind" node
	 *         }
	 *       }
	 *     })
	 */
	function visit(root, visitor, keyMap) {
	  var visitorKeys = keyMap || QueryDocumentKeys;

	  var stack = void 0;
	  var inArray = Array.isArray(root);
	  var keys = [root];
	  var index = -1;
	  var edits = [];
	  var parent = void 0;
	  var path = [];
	  var ancestors = [];
	  var newRoot = root;

	  do {
	    index++;
	    var isLeaving = index === keys.length;
	    var key = void 0;
	    var node = void 0;
	    var isEdited = isLeaving && edits.length !== 0;
	    if (isLeaving) {
	      key = ancestors.length === 0 ? undefined : path.pop();
	      node = parent;
	      parent = ancestors.pop();
	      if (isEdited) {
	        if (inArray) {
	          node = node.slice();
	        } else {
	          var clone = {};
	          for (var k in node) {
	            if (node.hasOwnProperty(k)) {
	              clone[k] = node[k];
	            }
	          }
	          node = clone;
	        }
	        var editOffset = 0;
	        for (var ii = 0; ii < edits.length; ii++) {
	          var editKey = edits[ii][0];
	          var editValue = edits[ii][1];
	          if (inArray) {
	            editKey -= editOffset;
	          }
	          if (inArray && editValue === null) {
	            node.splice(editKey, 1);
	            editOffset++;
	          } else {
	            node[editKey] = editValue;
	          }
	        }
	      }
	      index = stack.index;
	      keys = stack.keys;
	      edits = stack.edits;
	      inArray = stack.inArray;
	      stack = stack.prev;
	    } else {
	      key = parent ? inArray ? index : keys[index] : undefined;
	      node = parent ? parent[key] : newRoot;
	      if (node === null || node === undefined) {
	        continue;
	      }
	      if (parent) {
	        path.push(key);
	      }
	    }

	    var result = void 0;
	    if (!Array.isArray(node)) {
	      if (!isNode(node)) {
	        throw new Error('Invalid AST Node: ' + JSON.stringify(node));
	      }
	      var visitFn = getVisitFn(visitor, node.kind, isLeaving);
	      if (visitFn) {
	        result = visitFn.call(visitor, node, key, parent, path, ancestors);

	        if (result === BREAK) {
	          break;
	        }

	        if (result === false) {
	          if (!isLeaving) {
	            path.pop();
	            continue;
	          }
	        } else if (result !== undefined) {
	          edits.push([key, result]);
	          if (!isLeaving) {
	            if (isNode(result)) {
	              node = result;
	            } else {
	              path.pop();
	              continue;
	            }
	          }
	        }
	      }
	    }

	    if (result === undefined && isEdited) {
	      edits.push([key, node]);
	    }

	    if (!isLeaving) {
	      stack = { inArray: inArray, index: index, keys: keys, edits: edits, prev: stack };
	      inArray = Array.isArray(node);
	      keys = inArray ? node : visitorKeys[node.kind] || [];
	      index = -1;
	      edits = [];
	      if (parent) {
	        ancestors.push(parent);
	      }
	      parent = node;
	    }
	  } while (stack !== undefined);

	  if (edits.length !== 0) {
	    newRoot = edits[edits.length - 1][1];
	  }

	  return newRoot;
	}

	function isNode(maybeNode) {
	  return maybeNode && typeof maybeNode.kind === 'string';
	}

	/**
	 * Creates a new visitor instance which delegates to many visitors to run in
	 * parallel. Each visitor will be visited for each node before moving on.
	 *
	 * If a prior visitor edits a node, no following visitors will see that node.
	 */
	function visitInParallel(visitors) {
	  var skipping = new Array(visitors.length);

	  return {
	    enter: function enter(node) {
	      for (var i = 0; i < visitors.length; i++) {
	        if (!skipping[i]) {
	          var fn = getVisitFn(visitors[i], node.kind, /* isLeaving */false);
	          if (fn) {
	            var result = fn.apply(visitors[i], arguments);
	            if (result === false) {
	              skipping[i] = node;
	            } else if (result === BREAK) {
	              skipping[i] = BREAK;
	            } else if (result !== undefined) {
	              return result;
	            }
	          }
	        }
	      }
	    },
	    leave: function leave(node) {
	      for (var i = 0; i < visitors.length; i++) {
	        if (!skipping[i]) {
	          var fn = getVisitFn(visitors[i], node.kind, /* isLeaving */true);
	          if (fn) {
	            var result = fn.apply(visitors[i], arguments);
	            if (result === BREAK) {
	              skipping[i] = BREAK;
	            } else if (result !== undefined && result !== false) {
	              return result;
	            }
	          }
	        } else if (skipping[i] === node) {
	          skipping[i] = null;
	        }
	      }
	    }
	  };
	}

	/**
	 * Creates a new visitor instance which maintains a provided TypeInfo instance
	 * along with visiting visitor.
	 */
	function visitWithTypeInfo(typeInfo, visitor) {
	  return {
	    enter: function enter(node) {
	      typeInfo.enter(node);
	      var fn = getVisitFn(visitor, node.kind, /* isLeaving */false);
	      if (fn) {
	        var result = fn.apply(visitor, arguments);
	        if (result !== undefined) {
	          typeInfo.leave(node);
	          if (isNode(result)) {
	            typeInfo.enter(result);
	          }
	        }
	        return result;
	      }
	    },
	    leave: function leave(node) {
	      var fn = getVisitFn(visitor, node.kind, /* isLeaving */true);
	      var result = void 0;
	      if (fn) {
	        result = fn.apply(visitor, arguments);
	      }
	      typeInfo.leave(node);
	      return result;
	    }
	  };
	}

	/**
	 * Given a visitor instance, if it is leaving or not, and a node kind, return
	 * the function the visitor runtime should call.
	 */
	function getVisitFn(visitor, kind, isLeaving) {
	  var kindVisitor = visitor[kind];
	  if (kindVisitor) {
	    if (!isLeaving && typeof kindVisitor === 'function') {
	      // { Kind() {} }
	      return kindVisitor;
	    }
	    var kindSpecificVisitor = isLeaving ? kindVisitor.leave : kindVisitor.enter;
	    if (typeof kindSpecificVisitor === 'function') {
	      // { Kind: { enter() {}, leave() {} } }
	      return kindSpecificVisitor;
	    }
	  } else {
	    var specificVisitor = isLeaving ? visitor.leave : visitor.enter;
	    if (specificVisitor) {
	      if (typeof specificVisitor === 'function') {
	        // { enter() {}, leave() {} }
	        return specificVisitor;
	      }
	      var specificKindVisitor = specificVisitor[kind];
	      if (typeof specificKindVisitor === 'function') {
	        // { enter: { Kind() {} }, leave: { Kind() {} } }
	        return specificKindVisitor;
	      }
	    }
	  }
	}

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	// Name

	var NAME = exports.NAME = 'Name';

	// Document

	var DOCUMENT = exports.DOCUMENT = 'Document';
	var OPERATION_DEFINITION = exports.OPERATION_DEFINITION = 'OperationDefinition';
	var VARIABLE_DEFINITION = exports.VARIABLE_DEFINITION = 'VariableDefinition';
	var VARIABLE = exports.VARIABLE = 'Variable';
	var SELECTION_SET = exports.SELECTION_SET = 'SelectionSet';
	var FIELD = exports.FIELD = 'Field';
	var ARGUMENT = exports.ARGUMENT = 'Argument';

	// Fragments

	var FRAGMENT_SPREAD = exports.FRAGMENT_SPREAD = 'FragmentSpread';
	var INLINE_FRAGMENT = exports.INLINE_FRAGMENT = 'InlineFragment';
	var FRAGMENT_DEFINITION = exports.FRAGMENT_DEFINITION = 'FragmentDefinition';

	// Values

	var INT = exports.INT = 'IntValue';
	var FLOAT = exports.FLOAT = 'FloatValue';
	var STRING = exports.STRING = 'StringValue';
	var BOOLEAN = exports.BOOLEAN = 'BooleanValue';
	var ENUM = exports.ENUM = 'EnumValue';
	var LIST = exports.LIST = 'ListValue';
	var OBJECT = exports.OBJECT = 'ObjectValue';
	var OBJECT_FIELD = exports.OBJECT_FIELD = 'ObjectField';

	// Directives

	var DIRECTIVE = exports.DIRECTIVE = 'Directive';

	// Types

	var NAMED_TYPE = exports.NAMED_TYPE = 'NamedType';
	var LIST_TYPE = exports.LIST_TYPE = 'ListType';
	var NON_NULL_TYPE = exports.NON_NULL_TYPE = 'NonNullType';

	// Type System Definitions

	var SCHEMA_DEFINITION = exports.SCHEMA_DEFINITION = 'SchemaDefinition';
	var OPERATION_TYPE_DEFINITION = exports.OPERATION_TYPE_DEFINITION = 'OperationTypeDefinition';

	// Type Definitions

	var SCALAR_TYPE_DEFINITION = exports.SCALAR_TYPE_DEFINITION = 'ScalarTypeDefinition';
	var OBJECT_TYPE_DEFINITION = exports.OBJECT_TYPE_DEFINITION = 'ObjectTypeDefinition';
	var FIELD_DEFINITION = exports.FIELD_DEFINITION = 'FieldDefinition';
	var INPUT_VALUE_DEFINITION = exports.INPUT_VALUE_DEFINITION = 'InputValueDefinition';
	var INTERFACE_TYPE_DEFINITION = exports.INTERFACE_TYPE_DEFINITION = 'InterfaceTypeDefinition';
	var UNION_TYPE_DEFINITION = exports.UNION_TYPE_DEFINITION = 'UnionTypeDefinition';
	var ENUM_TYPE_DEFINITION = exports.ENUM_TYPE_DEFINITION = 'EnumTypeDefinition';
	var ENUM_VALUE_DEFINITION = exports.ENUM_VALUE_DEFINITION = 'EnumValueDefinition';
	var INPUT_OBJECT_TYPE_DEFINITION = exports.INPUT_OBJECT_TYPE_DEFINITION = 'InputObjectTypeDefinition';

	// Type Extensions

	var TYPE_EXTENSION_DEFINITION = exports.TYPE_EXTENSION_DEFINITION = 'TypeExtensionDefinition';

	// Directive Definitions

	var DIRECTIVE_DEFINITION = exports.DIRECTIVE_DEFINITION = 'DirectiveDefinition';

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.syntaxError = syntaxError;

	var _location = __webpack_require__(6);

	var _GraphQLError = __webpack_require__(4);

	/**
	 * Produces a GraphQLError representing a syntax error, containing useful
	 * descriptive information about the syntax error's position in the source.
	 */

	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	function syntaxError(source, position, description) {
	  var location = (0, _location.getLocation)(source, position);
	  var error = new _GraphQLError.GraphQLError('Syntax Error ' + source.name + ' (' + location.line + ':' + location.column + ') ' + description + '\n\n' + highlightSourceAtLocation(source, location), undefined, undefined, source, [position]);
	  return error;
	}

	/**
	 * Render a helpful description of the location of the error in the GraphQL
	 * Source document.
	 */
	function highlightSourceAtLocation(source, location) {
	  var line = location.line;
	  var prevLineNum = (line - 1).toString();
	  var lineNum = line.toString();
	  var nextLineNum = (line + 1).toString();
	  var padLen = nextLineNum.length;
	  var lines = source.body.split(/\r\n|[\n\r]/g);
	  return (line >= 2 ? lpad(padLen, prevLineNum) + ': ' + lines[line - 2] + '\n' : '') + lpad(padLen, lineNum) + ': ' + lines[line - 1] + '\n' + Array(2 + padLen + location.column).join(' ') + '^\n' + (line < lines.length ? lpad(padLen, nextLineNum) + ': ' + lines[line] + '\n' : '');
	}

	function lpad(len, str) {
	  return Array(len - str.length + 1).join(' ') + str;
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.locatedError = locatedError;

	var _GraphQLError = __webpack_require__(4);

	/**
	 * Given an arbitrary Error, presumably thrown while attempting to execute a
	 * GraphQL operation, produce a new GraphQLError aware of the location in the
	 * document responsible for the original Error.
	 */
	function locatedError(originalError, nodes, path) {
	  // Note: this uses a brand-check to support GraphQL errors originating from
	  // other contexts.
	  if (originalError && originalError.hasOwnProperty('locations')) {
	    return originalError;
	  }

	  var message = originalError ? originalError.message || String(originalError) : 'An unknown error occurred.';
	  var stack = originalError ? originalError.stack : null;
	  return new _GraphQLError.GraphQLError(message, nodes, stack, null, null, path, originalError);
	}
	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.formatError = formatError;

	var _invariant = __webpack_require__(14);

	var _invariant2 = _interopRequireDefault(_invariant);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Given a GraphQLError, format it according to the rules described by the
	 * Response Format, Errors section of the GraphQL Specification.
	 */
	function formatError(error) {
	  (0, _invariant2.default)(error, 'Received null or undefined error.');
	  return {
	    message: error.message,
	    locations: error.locations
	  };
	}
	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = invariant;

	/**
	 *  Copyright (c) 2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	function invariant(condition, message) {
	  if (!condition) {
	    throw new Error(message);
	  }
	}

/***/ }
/******/ ]);
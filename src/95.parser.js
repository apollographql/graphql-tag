webpackJsonpparser([95],{

/***/ 67:
/***/ function(module, exports, __webpack_require__) {

	var cbs = [], 
		data;
	module.exports = function(cb) {
		if(cbs) cbs.push(cb);
		else cb(data);
	}
	__webpack_require__.e/* nsure */(34, function(require) {
		data = __webpack_require__(68);
		var callbacks = cbs;
		cbs = null;
		for(var i = 0, l = callbacks.length; i < l; i++) {
			callbacks[i](data);
		}
	});

/***/ },

/***/ 190:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Source = undefined;

	var _classCallCheck2 = __webpack_require__(67);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
	  (0, _classCallCheck3.default)(this, Source);

	  this.body = body;
	  this.name = name || 'GraphQL';
	};

/***/ }

});
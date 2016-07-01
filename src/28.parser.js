webpackJsonpparser([28],{

/***/ 56:
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(57) && !__webpack_require__(59)(function(){
	  return Object.defineProperty(__webpack_require__(61)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },

/***/ 59:
/***/ function(module, exports, __webpack_require__) {

	var cbs = [], 
		data;
	module.exports = function(cb) {
		if(cbs) cbs.push(cb);
		else cb(data);
	}
	__webpack_require__.e/* nsure */(30, function(require) {
		data = __webpack_require__(60);
		var callbacks = cbs;
		cbs = null;
		for(var i = 0, l = callbacks.length; i < l; i++) {
			callbacks[i](data);
		}
	});

/***/ },

/***/ 61:
/***/ function(module, exports, __webpack_require__) {

	var cbs = [], 
		data;
	module.exports = function(cb) {
		if(cbs) cbs.push(cb);
		else cb(data);
	}
	__webpack_require__.e/* nsure */(31, function(require) {
		data = __webpack_require__(62);
		var callbacks = cbs;
		cbs = null;
		for(var i = 0, l = callbacks.length; i < l; i++) {
			callbacks[i](data);
		}
	});

/***/ }

});
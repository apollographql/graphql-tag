webpackJsonpparser([59],{

/***/ 49:
/***/ function(module, exports, __webpack_require__) {

	var cbs = [], 
		data;
	module.exports = function(cb) {
		if(cbs) cbs.push(cb);
		else cb(data);
	}
	__webpack_require__.e/* nsure */(25, function(require) {
		data = __webpack_require__(50);
		var callbacks = cbs;
		cbs = null;
		for(var i = 0, l = callbacks.length; i < l; i++) {
			callbacks[i](data);
		}
	});

/***/ },

/***/ 118:
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(49).f
	  , has = __webpack_require__(29)
	  , TAG = __webpack_require__(119)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ }

});
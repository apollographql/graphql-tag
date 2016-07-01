webpackJsonpparser([81],{

/***/ 139:
/***/ function(module, exports, __webpack_require__) {

	var cbs = [], 
		data;
	module.exports = function(cb) {
		if(cbs) cbs.push(cb);
		else cb(data);
	}
	__webpack_require__.e/* nsure */(70, function(require) {
		data = __webpack_require__(140);
		var callbacks = cbs;
		cbs = null;
		for(var i = 0, l = callbacks.length; i < l; i++) {
			callbacks[i](data);
		}
	});

/***/ },

/***/ 162:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(139)('observable');

/***/ }

});
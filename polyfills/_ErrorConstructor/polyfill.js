/* global CreateMethodProperty, CreateNonEnumerableDataPropertyOrThrow, Get, HasProperty, Type */

// eslint-disable-next-line no-unused-vars
var _ErrorConstructor;

(function () {
	// 20.5.8.1 InstallErrorCause ( O, options )
	function InstallErrorCause(O, options) {
		// 1. If options is an Object and ? HasProperty(options, "cause") is true, then
		if (Type(options) === 'object' && HasProperty(options, 'cause')) {
			// a. Let cause be ? Get(options, "cause").
			var cause = Get(options, 'cause');
			// b. Perform CreateNonEnumerableDataPropertyOrThrow(O, "cause", cause).
			CreateNonEnumerableDataPropertyOrThrow(O, 'cause', cause);
		}
		// 2. Return unused.
	}

	// based on https://github.com/es-shims/error-cause/blob/de17ea05/Error/implementation.js#L12-L20
	function _makeErrorConstructor (name, _Error) {
		var _NativeError = _nativeErrors[name];
		var arity = _Error.length;
		// `prototype` is new.target's prototype, or undefined for a call.
		return function (prototype, args) {
			var O = arity === 2
				? _NativeError.call(null, args[0], args[1])
				: _NativeError.call(null, args[0]);
			InstallErrorCause(O, args.length > arity && args[arity]);
			if (Type(prototype) === 'object' && prototype !== _Error.prototype) {
				O = Object.setPrototypeOf(O, prototype);
			} else {
				CreateMethodProperty(O, 'constructor', _Error);
			}
			return O;
		}
	}

	// based on https://github.com/es-shims/error-cause/blob/de17ea05/Error/implementation.js#L22-L29
	function _inheritErrorPrototype (name, _Error) {
		if (name !== 'Error') {
			Object.setPrototypeOf(_Error, self.Error);
		}
		_Error.prototype = _nativeErrors[name].prototype;
		Object.defineProperty(_Error, 'prototype', { writable: false });
		// in IE11, the constructor name needs to be corrected
		if (_Error.name !== name) {
			Object.defineProperty(_Error, 'name', { value: name, configurable: true });
		}
		return _Error;
	}

	var _nativeErrors = {};
	var _errorConstructors = {};

	var _parameters = {
		Error:          '_message',
		EvalError:      '_message',
		RangeError:     '_message',
		ReferenceError: '_message',
		SyntaxError:    '_message',
		TypeError:      '_message',
		URIError:       '_message',
		AggregateError: '_errors, _message'
	};

	// Without new.target, a subclass's super() is recognised by `this` inheriting from the constructor.
	function _thisPrototype (that, _Error) {
		return that instanceof _Error ? Object.getPrototypeOf(that) : undefined;
	}

	var _newErrors = {};
	try {
		for (var _name in _parameters) {
			_newErrors[_name] = Function('_errorConstructors',
				'return function ' + _name + ' (' + _parameters[_name] + ') { ' +
				'return _errorConstructors.' + _name + '(new.target && new.target.prototype, arguments); };'
			)(_errorConstructors);
		}
	} catch (_) {
		_newErrors = {
			Error:          function Error          (_message) { return _errorConstructors.Error(_thisPrototype(this, _newErrors.Error), arguments); },
			EvalError:      function EvalError      (_message) { return _errorConstructors.EvalError(_thisPrototype(this, _newErrors.EvalError), arguments); },
			RangeError:     function RangeError     (_message) { return _errorConstructors.RangeError(_thisPrototype(this, _newErrors.RangeError), arguments); },
			ReferenceError: function ReferenceError (_message) { return _errorConstructors.ReferenceError(_thisPrototype(this, _newErrors.ReferenceError), arguments); },
			SyntaxError:    function SyntaxError    (_message) { return _errorConstructors.SyntaxError(_thisPrototype(this, _newErrors.SyntaxError), arguments); },
			TypeError:      function TypeError      (_message) { return _errorConstructors.TypeError(_thisPrototype(this, _newErrors.TypeError), arguments); },
			URIError:       function URIError       (_message) { return _errorConstructors.URIError(_thisPrototype(this, _newErrors.URIError), arguments); },
			AggregateError: function AggregateError (_errors, _message) { return _errorConstructors.AggregateError(_thisPrototype(this, _newErrors.AggregateError), arguments); }
		};
	}

	_ErrorConstructor = function (name) {
		_nativeErrors[name] = self[name];
		_errorConstructors[name] = _makeErrorConstructor(name, _newErrors[name]);
		_inheritErrorPrototype(name, _newErrors[name]);
		return _newErrors[name];
	}
})();

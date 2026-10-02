/* global _ErrorConstructor, CreateMethodProperty, CreateNonEnumerableDataPropertyOrThrow, IterableToList */
(function () {
	var hasErrorCause = (function () {
		try {
			return new Error('m', { cause: 'c' }).cause === 'c';
		} catch (e) {
			return false;
		}
	})();

	var NativeError = Error.prototype.constructor;

	function AggregateError (errors, message) {
		var prototype = this instanceof AggregateError ? Object.getPrototypeOf(this) : AggregateError.prototype;
		// A native error carries the internal slot behind the [object Error] tag.
		var O = Object.setPrototypeOf(typeof message === 'undefined' ? new NativeError() : new NativeError(message), prototype);
		if (typeof NativeError.captureStackTrace === 'function') {
			NativeError.captureStackTrace(O, AggregateError);
		}

		var errorsList;
		if (Array.isArray(errors)) {
			errorsList = errors.slice();
		} else {
			try {
				errorsList = IterableToList(errors);
			} catch (_error) {
				throw new TypeError('Argument is not iterable');
			}
		}

		CreateNonEnumerableDataPropertyOrThrow(O, 'errors', errorsList);
		return O;
	}

	AggregateError.prototype = Object.create(Error.prototype);
	CreateMethodProperty(AggregateError.prototype, 'constructor', AggregateError);
	CreateMethodProperty(AggregateError.prototype, 'name', 'AggregateError');
	CreateMethodProperty(AggregateError.prototype, 'message', '');

	CreateMethodProperty(self, 'AggregateError', AggregateError);

	// If `Error.cause` is available, add it to `AggregateError`
	if (hasErrorCause) {
		CreateMethodProperty(self, 'AggregateError', _ErrorConstructor('AggregateError'));
	}
})();

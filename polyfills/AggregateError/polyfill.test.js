
/* globals AggregateError */

function makeArrayIterator (array) {
	var i = 0;
	var iterator = {};
	// polyfill for `Symbol.iterator` has been provided as part of `IterableToList`
	iterator[self.Symbol.iterator] = function () {
		return {
			next: function() {
				return i >= array.length
					? { done: true }
					: { value: array[i++] };
			}
		};
	};
	return iterator;
}

var hasErrorCause = (function () {
	try {
		return new Error('m', { cause: 'c' }).cause === 'c';
	} catch (e) {
		return false;
	}
})();

it('is a function', function () {
	proclaim.isFunction(AggregateError);
});

it('has correct arity', function () {
	proclaim.arity(AggregateError, 2);
});

it('has correct name', function () {
	proclaim.hasName(AggregateError, 'AggregateError');
});

it('is not enumerable', function () {
	proclaim.isNotEnumerable(self, 'AggregateError');
});

it('has the right prototype', function () {
	try {
		proclaim.equal(Object.getPrototypeOf(AggregateError), Error);
	} catch (err) {
		// `Error` flavors have the wrong prototype in ie9 and ie10
		proclaim.equal(Object.getPrototypeOf(AggregateError), Function.prototype);
	}
});

describe('AggregateError', function () {
	it("returns an AggregateError", function () {
		var aggregateError = AggregateError([]);
		proclaim.ok(aggregateError instanceof Error);
		proclaim.ok(aggregateError instanceof AggregateError);
		proclaim.equal(aggregateError.name, 'AggregateError');
	});

	it("constructs an AggregateError", function () {
		var aggregateError = new AggregateError([]);
		proclaim.ok(aggregateError instanceof Error);
		proclaim.ok(aggregateError instanceof AggregateError);
		proclaim.equal(aggregateError.name, 'AggregateError');
	});

	it("constructs an AggregateError when passed an array", function () {
		var errors = [new Error('x'), new Error('y')];
		var aggregateError = new AggregateError(errors);
		proclaim.equal(aggregateError.message, '');
		proclaim.notEqual(aggregateError.errors, errors);
		proclaim.deepStrictEqual(aggregateError.errors, errors);
	});

	it("constructs an AggregateError when passed an array and message", function () {
		var errors = [new Error('x'), new Error('y')];
		var aggregateError = new AggregateError(errors, 'z');
		proclaim.equal(aggregateError.message, 'z');
		proclaim.notEqual(aggregateError.errors, errors);
		proclaim.deepStrictEqual(aggregateError.errors, errors);
	});

	it("constructs an AggregateError when passed an iterator", function () {
		var errors = [new Error('x'), new Error('y')];
		var iterator = makeArrayIterator(errors);
		var aggregateError = new AggregateError(iterator);
		proclaim.equal(aggregateError.message, '');
		proclaim.notEqual(aggregateError.errors, errors);
		proclaim.deepStrictEqual(aggregateError.errors, errors);
	});

	it("throws an error for input that is not iterable", function () {
		proclaim.throws(function () {
			new AggregateError(0)
		}, /is not iterable/);
	});

	it("has no enumerable own properties", function () {
		var aggregateError = new AggregateError([new Error('x')], 'm');
		proclaim.deepStrictEqual(Object.keys(aggregateError), []);
		proclaim.isNotEnumerable(aggregateError, 'message');
		proclaim.isNotEnumerable(aggregateError, 'errors');
	});

	it("inherits name from AggregateError.prototype", function () {
		proclaim.isFalse(Object.prototype.hasOwnProperty.call(new AggregateError([]), 'name'));
		proclaim.equal(AggregateError.prototype.name, 'AggregateError');
		proclaim.equal(AggregateError.prototype.message, '');
	});

	it("has no own message when message is undefined", function () {
		proclaim.isFalse(Object.prototype.hasOwnProperty.call(new AggregateError([]), 'message'));
	});

	it("is an Error to Object.prototype.toString", function () {
		proclaim.equal(Object.prototype.toString.call(new AggregateError([], 'm')), '[object Error]');
	});

	it("converts to a string like an Error", function () {
		proclaim.equal(String(new AggregateError([], 'm')), 'AggregateError: m');
	});

	if (hasErrorCause) {
		it('creates an AggregateError with a cause', function () {
			var error = new AggregateError([], 'm', { cause: 'c' });
			proclaim.equal(error.name, 'AggregateError');
			proclaim.deepEqual(error.errors, []);
			proclaim.equal(error.message, 'm');
			proclaim.equal(error.cause, 'c');
			proclaim.isNotEnumerable(error, 'cause');
		});
	}
});

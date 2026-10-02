/* global Int8Array */

// use "Int8Array" as a proxy for all "TypedArray" subclasses

it('is a function', function () {
	proclaim.isFunction(Int8Array.prototype.toSorted);
});

it('has correct arity', function () {
	proclaim.arity(Int8Array.prototype.toSorted, 1);
});

it('has correct name', function () {
	proclaim.hasName(Int8Array.prototype.toSorted, 'toSorted');
});

it('is not enumerable', function () {
	if ('__proto__' in Int8Array.prototype && self.Int8Array.prototype.__proto__ !== Object.prototype) {
		proclaim.isNotEnumerable(Int8Array.prototype.__proto__, 'toSorted');
	} else {
		proclaim.isNotEnumerable(Int8Array.prototype, 'toSorted');
	}
});

describe('toSorted', function () {
	// eslint-disable-next-line no-sparse-arrays
	var typedArray = new Int8Array([6, 4, 5, , 3]);

	it('should sort with no comparefn (by copy)', function () {
		proclaim.deepStrictEqual(typedArray.toSorted(), new Int8Array([0, 3, 4, 5, 6]));
		proclaim.equal(typedArray[0], 6);
	});

	it('should sort with comparefn (by copy)', function () {
		proclaim.deepStrictEqual(typedArray.toSorted(function (a, b) {
			return a - b;
		}), new Int8Array([0, 3, 4, 5, 6]));
		proclaim.equal(typedArray[0], 6);
	});

	it('should throw for invalid comparefn', function () {
		proclaim.throws(function () {
			typedArray.toSorted('invalid');
		});
	});

	var Uint8Subclass = (function () {
		try {
			return new Function('return class extends Uint8Array {}')();
		} catch (ignore) {
			return undefined;
		}
	}());

	if (Uint8Subclass) {
		it('returns a plain Uint8Array for a Uint8Array subclass', function () {
			var result = new Uint8Subclass([3, 1, 2]).toSorted();
			proclaim.strictEqual(Object.getPrototypeOf(result), self.Uint8Array.prototype);
			proclaim.deepStrictEqual(Array.prototype.slice.call(result), [1, 2, 3]);
		});
	}

	if ('BigInt' in self && 'BigInt64Array' in self && typeof self.BigInt64Array.prototype.toSorted === 'function') {
		it('returns a BigInt64Array for a BigInt64Array', function () {
			var result = new self.BigInt64Array([self.BigInt(3), self.BigInt(1), self.BigInt(2)]).toSorted();
			proclaim.strictEqual(Object.getPrototypeOf(result), self.BigInt64Array.prototype);
			proclaim.deepStrictEqual(Array.prototype.slice.call(result), [self.BigInt(1), self.BigInt(2), self.BigInt(3)]);
		});

		it('returns a BigUint64Array for a BigUint64Array', function () {
			var result = new self.BigUint64Array([self.BigInt(3), self.BigInt(1), self.BigInt(2)]).toSorted();
			proclaim.strictEqual(Object.getPrototypeOf(result), self.BigUint64Array.prototype);
			proclaim.deepStrictEqual(Array.prototype.slice.call(result), [self.BigInt(1), self.BigInt(2), self.BigInt(3)]);
		});
	}
});

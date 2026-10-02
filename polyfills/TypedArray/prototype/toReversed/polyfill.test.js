/* global Int8Array */

// use "Int8Array" as a proxy for all "TypedArray" subclasses

it('is a function', function () {
	proclaim.isFunction(Int8Array.prototype.toReversed);
});

it('has correct arity', function () {
	proclaim.arity(Int8Array.prototype.toReversed, 0);
});

it('has correct name', function () {
	proclaim.hasName(Int8Array.prototype.toReversed, 'toReversed');
});

it('is not enumerable', function () {
	if ('__proto__' in Int8Array.prototype && self.Int8Array.prototype.__proto__ !== Object.prototype) {
		proclaim.isNotEnumerable(Int8Array.prototype.__proto__, 'toReversed');
	} else {
		proclaim.isNotEnumerable(Int8Array.prototype, 'toReversed');
	}
});

describe('toReversed', function () {
	var typedArray = new Int8Array([3, 4, 5, 6]);

	it('should reverse (by copy)', function () {
		proclaim.deepStrictEqual(typedArray.toReversed(), new Int8Array([6, 5, 4, 3]));
		proclaim.equal(typedArray[0], 3);
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
			var result = new Uint8Subclass([3, 1, 2]).toReversed();
			proclaim.strictEqual(Object.getPrototypeOf(result), self.Uint8Array.prototype);
			proclaim.deepStrictEqual(Array.prototype.slice.call(result), [2, 1, 3]);
		});
	}

	if ('BigInt' in self && 'BigInt64Array' in self && typeof self.BigInt64Array.prototype.toReversed === 'function') {
		it('returns a BigInt64Array for a BigInt64Array', function () {
			var result = new self.BigInt64Array([self.BigInt(3), self.BigInt(1), self.BigInt(2)]).toReversed();
			proclaim.strictEqual(Object.getPrototypeOf(result), self.BigInt64Array.prototype);
			proclaim.deepStrictEqual(Array.prototype.slice.call(result), [self.BigInt(2), self.BigInt(1), self.BigInt(3)]);
		});

		it('returns a BigUint64Array for a BigUint64Array', function () {
			var result = new self.BigUint64Array([self.BigInt(3), self.BigInt(1), self.BigInt(2)]).toReversed();
			proclaim.strictEqual(Object.getPrototypeOf(result), self.BigUint64Array.prototype);
			proclaim.deepStrictEqual(Array.prototype.slice.call(result), [self.BigInt(2), self.BigInt(1), self.BigInt(3)]);
		});
	}

	it('returns a typed array of this realm for a typed array from another realm', function () {
		var iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		try {
			var OtherUint8Array = iframe.contentWindow.Uint8Array;
			proclaim.notStrictEqual(OtherUint8Array, self.Uint8Array);
			var result = self.Uint8Array.prototype.toReversed.call(new OtherUint8Array([3, 1, 2]));
			proclaim.strictEqual(Object.getPrototypeOf(result), self.Uint8Array.prototype);
			proclaim.deepStrictEqual(Array.prototype.slice.call(result), [2, 1, 3]);
		} finally {
			document.body.removeChild(iframe);
		}
	});
});

it('is a function', function () {
	proclaim.isFunction(String.prototype.at);
});

it('has correct arity', function () {
	proclaim.arity(String.prototype.at, 1);
});

it('has correct name', function () {
	proclaim.hasName(String.prototype.at, 'at');
});

it('is not enumerable', function () {
	proclaim.isNotEnumerable(String.prototype, 'at');
});

describe('at', function () {
	it('retrieves values by index for strings', function () {
		var string = 'abc';
		proclaim.equal(string.at(undefined), 'a');
		proclaim.equal(string.at(-4), undefined);
		proclaim.equal(string.at(-2), 'b');
		proclaim.equal(string.at(-0.5), 'a');
		proclaim.equal(string.at(0), 'a');
		proclaim.equal(string.at(0.5), 'a');
		proclaim.equal(string.at(2), 'c');
		proclaim.equal(string.at(4), undefined);
	});

	var supportsStrictModeTests = (function () {
		'use strict';

		return this === undefined;
	}).call(undefined);

	if (supportsStrictModeTests) {
		it('throws a TypeError when called on null or undefined', function () {
			proclaim.throws(function () {
				String.prototype.at.call(null, 0);
			}, TypeError);
			proclaim.throws(function () {
				String.prototype.at.call(undefined, 0);
			}, TypeError);
		});
	}
});

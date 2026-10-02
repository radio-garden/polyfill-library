/* global CreateMethodProperty, Get, LengthOfArrayLike, ToIntegerOrInfinity, ToObject, ToString */
// 23.1.3.1. Array.prototype.at ( index )
CreateMethodProperty(Array.prototype, 'at', function at(index) {
	'use strict';
	// 1. Let O be ? ToObject(this value).
	var O = ToObject(this);
	// 2. Let len be ? LengthOfArrayLike(O).
	var len = LengthOfArrayLike(O);
	// 3. Let relativeIndex be ? ToIntegerOrInfinity(index).
	var relativeIndex = ToIntegerOrInfinity(index);
	// 4. If relativeIndex ≥ 0, then
	// 4.a. Let k be relativeIndex.
	// 5. Else,
	// 5.a. Let k be len + relativeIndex.
	var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
	// 6. If k < 0 or k ≥ len, return undefined.
	if (k < 0 || k >= len) return undefined;
	// 7. Return ? Get(O, ! ToString(𝔽(k))).
	return Get(O, ToString(k));
});

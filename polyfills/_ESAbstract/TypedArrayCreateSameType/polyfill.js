/* global TypedArrayCreate */
// 23.2.4.3 TypedArrayCreateSameType ( exemplar, argumentList )
function TypedArrayCreateSameType(exemplar, argumentList) { // eslint-disable-line no-unused-vars
	// 1. Let constructor be the intrinsic object associated with the constructor name exemplar.[[TypedArrayName]] in Table 68.
	var names = ['Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array'];
	var constructor;
	for (var i = 0; i < names.length && !constructor; i++) {
		var candidate = self[names[i]];
		if (candidate && Object.prototype.isPrototypeOf.call(candidate.prototype, exemplar)) {
			constructor = candidate;
		}
	}

	// 2. Let result be ? TypedArrayCreate(constructor, argumentList).
	var result = TypedArrayCreate(constructor, argumentList);
	// 3. Assert: result has [[TypedArrayName]] and [[ContentType]] internal slots.
	// 4. Assert: result.[[ContentType]] is exemplar.[[ContentType]].
	// 5. Return result.
	return result;
}

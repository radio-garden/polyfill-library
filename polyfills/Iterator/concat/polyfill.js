/* global Call, CreateIterResultObject, CreateMethodProperty, Get, GetMethod, Iterator, IteratorClose, IteratorStepValue, NormalCompletion, Symbol, Type */

var IteratorHelperPrototype = (function () {
	var iterator = Object.create(Iterator.prototype);
	iterator[Symbol.iterator] = function () {
		return {
			next: function () {
				return { value: undefined, done: true };
			}
		};
	};
	// use `Iterator.prototype.take` as a way to get `IteratorHelperPrototype`
	var iteratorHelper = iterator.take(0);
	return Object.getPrototypeOf(iteratorHelper);
})();

// 27.1.3.2.1 Iterator.concat ( ...items )
CreateMethodProperty(Iterator, "concat", function concat(/* ...items */) {
	// 1. Let iterables be a new empty List.
	var iterables = [];
	// 2. For each element item of items, do
	for (var i = 0; i < arguments.length; i++) {
		var item = arguments[i];
		// a. If item is not an Object, throw a TypeError exception.
		if (Type(item) !== "object") {
			throw new TypeError("item is not an object");
		}
		// b. Let method be ? GetMethod(item, %Symbol.iterator%).
		var method = GetMethod(item, Symbol.iterator);
		// c. If method is undefined, throw a TypeError exception.
		if (method === undefined) {
			throw new TypeError("method is undefined");
		}
		// d. Append the Record { [[OpenMethod]]: method, [[Iterable]]: item } to iterables.
		iterables.push({
			"[[OpenMethod]]": method,
			"[[Iterable]]": item,
			// Polyfill-library - keep track of iterator here
			_iteratorRecord: undefined
		});
	}
	// 3. Let closure be a new Abstract Closure with no parameters that captures iterables and performs the following steps when called:
	// 4. Let gen be CreateIteratorFromClosure(closure, "Iterator Helper", %IteratorHelperPrototype%, « [[UnderlyingIterators]] »).
	var gen = Object.create(IteratorHelperPrototype);
	var done = false;

	CreateMethodProperty(gen, "next", function () {
		try {
			// a. For each Record iterable of iterables, do
			// Polyfill-library - the current iterable is the first; we `shift` it when it's done
			while (!done && iterables.length > 0) {
				var iterable = iterables[0];
				if (!iterable._iteratorRecord) {
					// i. Let iter be ? Call(iterable.[[OpenMethod]], iterable.[[Iterable]]).
					var iter = Call(iterable["[[OpenMethod]]"], iterable["[[Iterable]]"]);
					// ii. If iter is not an Object, throw a TypeError exception.
					if (Type(iter) !== "object") {
						throw new TypeError("iter is not an object");
					}
					// iii. Let iteratorRecord be ? GetIteratorDirect(iter).
					iterable._iteratorRecord = {
						"[[Iterator]]": iter,
						"[[NextMethod]]": Get(iter, "next")
					};
				}
				// iv. Let innerAlive be true.
				// v. Repeat, while innerAlive is true,
				// 1. Let innerValue be ? IteratorStepValue(iteratorRecord).
				var innerValue = IteratorStepValue(iterable._iteratorRecord);
				// 2. If innerValue is done, then
				if (innerValue === IteratorStepValue.DONE) {
					// a. Set innerAlive to false.
					iterables.shift();
				}
				// 3. Else,
				else {
					// a. Let completion be Completion(Yield(innerValue)).
					// b. If completion is an abrupt completion, then
					// i. Return ? IteratorClose(iteratorRecord, completion).
					// Polyfill-library - only `return` resumes a Yield abruptly; it closes the iterator below
					return CreateIterResultObject(innerValue, false);
				}
			}
		} catch (error) {
			done = true;
			throw error;
		}
		// b. Return ReturnCompletion(undefined).
		done = true;
		return CreateIterResultObject(undefined, true);
	});

	CreateMethodProperty(gen, "return", function () {
		var iterable = iterables[0];
		var wasDone = done;
		done = true;
		if (!wasDone && iterable && iterable._iteratorRecord) {
			IteratorClose(iterable._iteratorRecord, NormalCompletion());
		}
		return CreateIterResultObject(undefined, true);
	});

	// 5. Set gen.[[UnderlyingIterators]] to a new empty List.
	// 6. Return gen.
	return gen;
});

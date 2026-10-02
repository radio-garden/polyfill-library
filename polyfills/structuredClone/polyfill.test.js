/* globals ArrayBuffer, BigInt, DataView, JSON, Map, Set, Uint8Array, Uint32Array */

describe('structuredClone', function () {
	it('is a function', function () {
		proclaim.isFunction(structuredClone);
	});

	it('has correct arity', function () {
		proclaim.arity(structuredClone, 1);
	});

	var date = new Date();

	var bi = null;
	if ("BigInt" in window && typeof BigInt == "function"){
		try {
			bi = BigInt(1);
		} catch (e) {
			//no BigInt support.
		}
	}

	var obj = {
		arr: [],
		bigint: bi,
		"boolean": true,
		number: 123,
		string: '',
		undefined: void 0,
		"null": null,
		"int": new Uint32Array([1, 2, 3]),
		map: new Map([['a', 123]]),
		set: new Set(['a', 'b']),
		Bool: new Boolean(false),
		Num: new Number(0),
		Str: new String(''),
		re: new RegExp('test', 'gim'),
		error: new Error('test'),
		BI: Object(bi),
		date: date
	};

	obj.arr.push(obj, obj, obj);

	var deserialized = structuredClone(obj);

	it('has correct name', function () {
		proclaim.hasName(structuredClone, 'structuredClone');
	});

	it('serializes correct types', function () {
		proclaim.isInstanceOf(deserialized.int, Uint32Array);
		proclaim.isInstanceOf(deserialized.Bool, Boolean);
		proclaim.isInstanceOf(deserialized.Num, Number);
		proclaim.isInstanceOf(deserialized.Str, String);
		proclaim.isInstanceOf(deserialized.re, RegExp);
		proclaim.isInstanceOf(deserialized.error, Error);
		proclaim.isInstanceOf(deserialized.date, Date);

		if (bi){
			proclaim.isInstanceOf(deserialized.BI, BigInt);
		}
	});

	it('serializes values', function () {
		/* eslint-disable-next-line dot-notation */
		proclaim.equal(deserialized['boolean'], true);
		proclaim.equal(deserialized.number, 123);
		proclaim.equal(deserialized.string, '');
		proclaim.equal(deserialized.undefined, void 0);
		/* eslint-disable-next-line dot-notation */
		proclaim.equal(deserialized["null"], null);

		/* eslint-disable-next-line dot-notation */
		proclaim.equal(deserialized['int'].length, 3);
		/* eslint-disable-next-line dot-notation */
		proclaim.equal(deserialized['int'][0], 1);
		/* eslint-disable-next-line dot-notation */
		proclaim.equal(deserialized['int'][1], 2);
		/* eslint-disable-next-line dot-notation */
		proclaim.equal(deserialized['int'][2], 3);

		proclaim.equal(deserialized.map.size, 1);
		proclaim.equal(deserialized.map.get('a'), 123);

		proclaim.equal(deserialized.set.size, 2);
		proclaim.equal(deserialized.set.has('a'), true);
		proclaim.equal(deserialized.set.has('b'), true);

		proclaim.equal(deserialized.Bool.valueOf(), false);
		proclaim.equal(deserialized.Num.valueOf(), 0);
		proclaim.equal(deserialized.Str.valueOf(), '');
		proclaim.equal(deserialized.re.source, 'test');
		proclaim.equal(deserialized.re.multiline, true);
		proclaim.equal(deserialized.re.ignoreCase, true);
		proclaim.equal(deserialized.re.global, true);
		proclaim.equal(deserialized.error.message, 'test');
		proclaim.equal(deserialized.date.toISOString(), date.toISOString());

		if (bi) {
			proclaim.equal(deserialized.bigint, bi);
			proclaim.equal(deserialized.BI.valueOf(), bi);
		}
	});

	if (typeof ArrayBuffer === 'function') {
		it('clones an ArrayBuffer with its contents', function () {
			var clone = structuredClone(new Uint8Array([1, 2, 3]).buffer);
			proclaim.equal(Object.prototype.toString.call(clone), '[object ArrayBuffer]');
			proclaim.equal(clone.byteLength, 3);
			proclaim.equal(new Uint8Array(clone)[2], 3);
		});
	}

	if (typeof DataView === 'function') {
		it('clones a DataView with its contents', function () {
			var view = new DataView(new ArrayBuffer(4));
			view.setUint8(3, 7);
			var clone = structuredClone(view);
			proclaim.isInstanceOf(clone, DataView);
			proclaim.equal(clone.byteLength, 4);
			proclaim.equal(clone.getUint8(3), 7);
		});

		it('keeps the offset, length and buffer of a DataView', function () {
			var buffer = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]).buffer;
			var clone = structuredClone({ buffer: buffer, view: new DataView(buffer, 4, 2) });
			proclaim.equal(clone.view.byteOffset, 4);
			proclaim.equal(clone.view.byteLength, 2);
			proclaim.equal(clone.view.getUint8(0), 4);
			proclaim.strictEqual(clone.view.buffer, clone.buffer);
		});
	}

	it('clones an invalid Date', function () {
		var clone = structuredClone(new Date(NaN));
		proclaim.isInstanceOf(clone, Date);
		proclaim.isTrue(isNaN(clone.getTime()));
	});

	it('keeps every RegExp flag', function () {
		var flags = ['g', 'i', 'm', 's', 'u', 'y'];
		for (var i = 0; i < flags.length; i++) {
			var re;
			try {
				re = new RegExp('a', flags[i]);
			} catch (e) {
				continue;
			}
			proclaim.equal(String(structuredClone(re)), '/a/' + flags[i]);
		}
	});

	it('keeps the type of a native error', function () {
		var clone = structuredClone(new TypeError('test'));
		proclaim.isInstanceOf(clone, TypeError);
		proclaim.equal(clone.name, 'TypeError');
		proclaim.equal(clone.message, 'test');
	});

	it('clones an error with an unknown name as an Error', function () {
		var error = new Error('test');
		error.name = 'CustomError';
		var clone = structuredClone(error);
		proclaim.isInstanceOf(clone, Error);
		proclaim.equal(clone.message, 'test');
	});

	it('clones an error named after a non-error global as an Error', function () {
		var names = ['Function', 'Array', 'Worker', 'Object'];
		for (var i = 0; i < names.length; i++) {
			var error = new Error('test');
			error.name = names[i];
			var clone = structuredClone(error);
			proclaim.isInstanceOf(clone, Error, names[i]);
			proclaim.equal(clone.name, 'Error', names[i]);
			proclaim.equal(clone.message, 'test', names[i]);
		}
	});

	it('throws on a function, even inside an object', function () {
		proclaim.throws(function () {
			structuredClone(function () {});
		});
		proclaim.throws(function () {
			structuredClone({ f: function () {} });
		});
	});

	it('clones an own "__proto__" key as a property', function () {
		var source = JSON.parse('{"__proto__": {"x": 1}}');
		var clone = structuredClone(source);
		proclaim.deepStrictEqual(Object.keys(clone), ['__proto__']);
		proclaim.isUndefined(clone.x);
	});


	it('keeps 0 and -0 apart', function () {
		var clone = structuredClone([0, -0]);
		proclaim.equal(1 / clone[0], Infinity);
		proclaim.equal(1 / clone[1], -Infinity);
		clone = structuredClone([-0, 0]);
		proclaim.equal(1 / clone[0], -Infinity);
		proclaim.equal(1 / clone[1], Infinity);
	});

	it('preserves references', function () {
		proclaim.equal(deserialized.arr.length, 3);
		proclaim.equal(deserialized.arr[0], deserialized);
		proclaim.equal(deserialized.arr[1], deserialized);
		proclaim.equal(deserialized.arr[2], deserialized);
	});
});

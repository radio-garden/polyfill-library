/* global Map, Set, BigInt, DataView, Uint8Array */
"use strict";

(function (env) {
	var VOID = -1;
	var PRIMITIVE = 0;
	var ARRAY = 1;
	var OBJECT = 2;
	var DATE = 3;
	var REGEXP = 4;
	var MAP = 5;
	var SET = 6;
	var ERROR = 7;
	var BIGINT = 8;

	function deserializer($, _) {
		function as(out, index) {
			$.set(index, out);
			return out;
		}

		function unpair(index) {
			var i, l;

			if ($.has(index)) {
				return $.get(index);
			}

			var type = _[index][0];
			var value = _[index][1];

			switch (type) {
				case PRIMITIVE:
				case VOID:
					return as(value, index);

				case ARRAY: {
					var arr = as([], index);
					for (i = 0, l = value.length; i < l; ++i) {
						arr.push(unpair(value[i]));
					}
					return arr;
				}

				case OBJECT: {
					var object = as({}, index);
					var keys = Object.keys(value);
					for (i = 0, l = keys.length; i < l; ++i) {
						var entry = value[keys[i]];
						var key = unpair(entry[0]);
						var keyValue = unpair(entry[1]);
						if (key === "__proto__") {
							Object.defineProperty(object, key, {
								value: keyValue,
								configurable: true,
								enumerable: true,
								writable: true
							});
						} else {
							object[key] = keyValue;
						}
					}

					return object;
				}

				case DATE:
					return as(new Date(value), index);

				case REGEXP: {
					return as(new RegExp(value.source, value.flags), index);
				}

				case MAP: {
					var map = as(new Map(), index);
					for (i = 0, l = value.length; i < l; ++i) {
						var mapEntry = value[i];
						map.set(unpair(mapEntry[0]), unpair(mapEntry[1]));
					}

					return map;
				}

				case SET: {
					var set = as(new Set(), index);
					for (i = 0, l = value.length; i < l; ++i) {
						set.add(unpair(value[i]));
					}
					return set;
				}

				case ERROR: {
					return as(typeof env[value.name] === "function" ? new env[value.name](value.message) : new Error(value.message), index);
				}

				case BIGINT:
					return as(BigInt(value), index);

				case "BigInt":
					return as(Object(BigInt(value)), index);

				case "ArrayBuffer":
					return as(new Uint8Array(value).buffer, index);

				case "DataView":
					return as(new DataView(new Uint8Array(value).buffer), index);
			}

			return as(new env[type](value), index);
		}

		return unpair;
	}

	function deserialize(serialized) {
		return deserializer(new Map(), serialized)(0);
	}

	var EMPTY = "";
	var emptyObject = {};

	function typeOf(value) {
		if (value instanceof Map) {
			return [MAP, EMPTY];
		}

		if (value instanceof Set) {
			return [SET, EMPTY];
		}

		var type = typeof value;
		if (type !== "object" || !value) {
			return [PRIMITIVE, type];
		}

		var asString = emptyObject.toString.call(value).slice(8, -1);

		switch (asString) {
			case "Array":
				return [ARRAY, EMPTY];

			case "Object":
				return [OBJECT, EMPTY];

			case "Date":
				return [DATE, EMPTY];

			case "RegExp":
				return [REGEXP, EMPTY];

			case "DataView":
				return [ARRAY, asString];
		}

		if (asString.indexOf("Array") !== -1) {
			return [ARRAY, asString];
		}

		if (value instanceof Error) {
			return [ERROR, value.name || "Error"];
		}

		return [OBJECT, asString];
	}

	function serializer($, _) {
		function as(out, value) {
			var index = _.push(out) - 1;
			$.set(value, index);
			return index;
		}

		function pair(value) {
			if ($.has(value)) {
				return $.get(value);
			}

			var i, l, keys;
			var to = typeOf(value);
			var TYPE = to[0];
			var typeName = to[1];

			switch (TYPE) {
				case PRIMITIVE: {
					var primitiveValue = value;

					switch (typeName) {
						case "bigint":
							TYPE = BIGINT;
							primitiveValue = value.toString();
							break;

						case "function":
						case "symbol":
							throw new TypeError("unable to serialize " + typeName);

						case "undefined":
							return as([VOID], value);
					}

					return as([TYPE, primitiveValue], value);
				}

				case ARRAY: {
					var arr = [];
					var arrayIndex = as([typeName || TYPE, arr], value);

					if (typeName) {
						var spread = value;
						if (typeName === "DataView") {
							spread = new Uint8Array(value.buffer);
						} else if (typeName === "ArrayBuffer") {
							spread = new Uint8Array(value);
						}
						for (i = 0, l = spread.length; i < l; ++i) {
							arr.push(spread[i]);
						}

					} else {
						for (i = 0, l = value.length; i < l; ++i) {
							arr.push(pair(value[i]));
						}
					}
					return arrayIndex;
				}

				case OBJECT: {
					if (typeName) {
						switch (typeName) {
							case "BigInt":
								return as([typeName, value.toString()], value);

							case "Boolean":
							case "Number":
							case "String":
								return as([typeName, value.valueOf()], value);
						}
					}

					var objectEntries = [];
					var index = as([TYPE, objectEntries], value);
					keys = Object.keys(value);
					for (i = 0, l = keys.length; i < l; ++i) {
						var objectKey = keys[i];
						objectEntries.push([pair(objectKey), pair(value[objectKey])]);
					}
					return index;
				}

				case DATE:
					return as([TYPE, isNaN(value.getTime()) ? EMPTY : value.toISOString()], value);

				case REGEXP: {
					return as([TYPE, {source: value.source, flags: value.flags}], value);
				}

				case MAP: {
					var mapEntries = [];
					var mapIndex = as([TYPE, mapEntries], value);
					value.forEach(function (value, key) {
						mapEntries.push([pair(key), pair(value)]);
					})

					return mapIndex;
				}

				case SET: {
					var setEntries = [];
					var setIndex = as([TYPE, setEntries], value);
					value.forEach(function (value) {
						setEntries.push(pair(value));
					})

					return setIndex;
				}
			}

			return as([TYPE, {name: typeName, message: value.message}], value);
		}

		return pair;
	}

	function serialize(value) {
		var _ = [];
		return serializer(new Map(), _)(value), _;
	}

	env.structuredClone = function structuredClone(any) {
		return deserialize(serialize(any));
	};

})(self);

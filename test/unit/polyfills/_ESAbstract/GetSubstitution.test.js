'use strict';

const test = require('node:test');
const { describe, it } = test;

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const polyfills = path.join(__dirname, '../../../../polyfills');

function loadGetSubstitution() {
	const context = vm.createContext({});
	context.self = context;
	for (const name of ['Type', 'GetSubstitution']) {
		vm.runInContext(fs.readFileSync(path.join(polyfills, '_ESAbstract', name, 'polyfill.js'), 'utf8'), context);
	}
	return context.GetSubstitution;
}

describe('_ESAbstract.GetSubstitution', () => {
	const GetSubstitution = loadGetSubstitution();

	it('replaces $n with the capture', () => {
		assert.strictEqual(GetSubstitution('b', 'abc', 1, ['x'], undefined, '[$1]'), '[x]');
	});

	it('replaces $n and $nn with the empty string when the capture is undefined', () => {
		assert.strictEqual(GetSubstitution('b', 'abc', 1, [undefined], undefined, '[$1]'), '[]');
		assert.strictEqual(GetSubstitution('b', 'abc', 1, [undefined], undefined, '[$01]'), '[]');
	});
});

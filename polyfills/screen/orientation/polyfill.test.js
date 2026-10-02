it('returns an object', function () {
	proclaim.isInstanceOf(window.screen.orientation, Object);
});

it('has type property', function () {
	var valid = {'landscape-primary': 1, 'landscape-secondary':1, 'portrait-primary':1, 'portrait-secondary':1};
	proclaim.equal(window.screen.orientation.type && valid[window.screen.orientation.type], true);
});

it('has angle property', function () {
	proclaim.isTypeOf(window.screen.orientation.angle, 'number');
});

it('returns the same object on every read', function () {
	proclaim.strictEqual(window.screen.orientation, window.screen.orientation);
});

it('has an angle that agrees with window.orientation where it exists', function () {
	if (typeof window.orientation !== 'number') {
		this.skip();
	}
	proclaim.strictEqual(window.screen.orientation.angle, (window.orientation + 360) % 360);
});

it('accepts change listeners', function () {
	var listener = function () {};
	proclaim.isTypeOf(window.screen.orientation.addEventListener, 'function');
	proclaim.isTypeOf(window.screen.orientation.removeEventListener, 'function');
	window.screen.orientation.addEventListener('change', listener);
	window.screen.orientation.removeEventListener('change', listener);
});

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

function isIPad() {
	return navigator.platform === 'iPad' || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

it('has an angle that agrees with window.orientation where it exists', function () {
	if (typeof window.orientation !== 'number') {
		this.skip();
	}
	// iPadOS takes landscape as the natural orientation, while window.orientation counts from portrait
	var expected = isIPad() ? (450 - window.orientation) % 360 : (window.orientation + 360) % 360;
	proclaim.strictEqual(window.screen.orientation.angle, expected);
});

it('accepts change listeners', function () {
	var listener = function () {};
	proclaim.isTypeOf(window.screen.orientation.addEventListener, 'function');
	proclaim.isTypeOf(window.screen.orientation.removeEventListener, 'function');
	window.screen.orientation.addEventListener('change', listener);
	window.screen.orientation.removeEventListener('change', listener);
});

describe('on a simulated device', function () {
	function simulate(test, device, check) {
		var overrides = [
			[window, 'orientation', device.orientation],
			[window.screen, 'width', device.width],
			[window.screen, 'height', device.height],
			[navigator, 'platform', device.platform],
			[navigator, 'maxTouchPoints', device.maxTouchPoints || 0]
		];
		var saved = [];
		var i;
		if ('ScreenOrientation' in window) {
			test.skip();
		}
		try {
			for (i = 0; i < overrides.length; i++) {
				saved.push([overrides[i][0], overrides[i][1], Object.getOwnPropertyDescriptor(overrides[i][0], overrides[i][1])]);
				Object.defineProperty(overrides[i][0], overrides[i][1], { value: overrides[i][2], configurable: true, writable: true });
			}
		} catch (e) {
			restore();
			test.skip();
		}
		function restore() {
			for (var j = saved.length - 1; j >= 0; j--) {
				if (saved[j][2]) {
					Object.defineProperty(saved[j][0], saved[j][1], saved[j][2]);
				} else {
					delete saved[j][0][saved[j][1]];
				}
			}
		}
		try {
			check(window.screen.orientation.type, window.screen.orientation.angle);
		} finally {
			restore();
		}
	}

	it('reports an iPad held in portrait relative to its landscape natural orientation', function () {
		simulate(this, { platform: 'iPad', orientation: 0, width: 768, height: 1024 }, function (type, angle) {
			proclaim.strictEqual(type, 'portrait-primary');
			proclaim.strictEqual(angle, 90);
		});
	});

	it('reports an iPad that identifies as a Mac held in landscape as landscape-primary at 0', function () {
		simulate(this, { platform: 'MacIntel', maxTouchPoints: 5, orientation: 90, width: 768, height: 1024 }, function (type, angle) {
			proclaim.strictEqual(type, 'landscape-primary');
			proclaim.strictEqual(angle, 0);
		});
	});

	it('reports an iPhone in landscape as landscape-primary at 90 although its screen size stays portrait', function () {
		simulate(this, { platform: 'iPhone', orientation: 90, width: 375, height: 667 }, function (type, angle) {
			proclaim.strictEqual(type, 'landscape-primary');
			proclaim.strictEqual(angle, 90);
		});
	});

	it('reports a landscape-natural tablet in its natural orientation as landscape-primary at 0', function () {
		simulate(this, { platform: 'Linux armv7l', orientation: 0, width: 1280, height: 800 }, function (type, angle) {
			proclaim.strictEqual(type, 'landscape-primary');
			proclaim.strictEqual(angle, 0);
		});
	});

	it('reports a landscape-natural tablet turned a quarter as portrait-primary at 90', function () {
		simulate(this, { platform: 'Linux armv7l', orientation: 90, width: 800, height: 1280 }, function (type, angle) {
			proclaim.strictEqual(type, 'portrait-primary');
			proclaim.strictEqual(angle, 90);
		});
	});

	it('reports a portrait-natural phone turned a quarter as landscape-primary at 90', function () {
		simulate(this, { platform: 'Linux armv7l', orientation: 90, width: 640, height: 360 }, function (type, angle) {
			proclaim.strictEqual(type, 'landscape-primary');
			proclaim.strictEqual(angle, 90);
		});
	});
});

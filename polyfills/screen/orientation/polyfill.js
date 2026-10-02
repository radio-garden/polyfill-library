(function() {

	var propName, nativeGetter, last, orientation, target, onchange = null;
	var err = ' not supported in the screen.orientation polyfill';

	function onchangeListener(event) {
		onchange.call(orientation, event);
	}

	function createOrientation() {
		try {
			// Where EventTarget is constructible the object is one, so event.target is screen.orientation
			orientation = target = new EventTarget();
		} catch (e) {
			target = document.createElement('div');
			orientation = {
				addEventListener: function () {
					return target.addEventListener.apply(target, arguments);
				},
				removeEventListener: function () {
					return target.removeEventListener.apply(target, arguments);
				},
				dispatchEvent: function () {
					return target.dispatchEvent.apply(target, arguments);
				}
			};
		}

		orientation.lock = function () {
			throw new Error('lock method'+err);
		};
		orientation.unlock = function () {
			throw new Error('unlock method'+err);
		};
		Object.defineProperty(orientation, 'onchange', {
			enumerable: true,
			get: function () {
				return onchange;
			},
			set: function (value) {
				var next = typeof value === 'function' ? value : null;
				if (next && !onchange) target.addEventListener('change', onchangeListener);
				if (!next && onchange) target.removeEventListener('change', onchangeListener);
				onchange = next;
			}
		});
		Object.defineProperty(orientation, 'type', {
			enumerable: true,
			get: function () {
				return current().type;
			}
		});
		Object.defineProperty(orientation, 'angle', {
			enumerable: true,
			get: function () {
				return current().angle;
			}
		});
	}

	function current() {
		var val, angle;

		if (nativeGetter) val = nativeGetter.call(window.screen);

		if (typeof val === 'string') {
			return { type: val, angle: (val.indexOf('secondary') !== -1) ? 180 : 0 };
		}

		if (typeof window.orientation === 'number') {
			var platform = navigator.platform;
			var iPad = platform === 'iPad' || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
			var landscapeNatural;

			angle = window.orientation;
			if (iPad) {
				// WebKit takes landscape as the iPad's natural orientation; window.orientation counts from portrait
				landscapeNatural = true;
				angle = 90 - angle;
			} else if (/^(iPhone|iPod)/.test(platform)) {
				// iOS keeps screen.width and screen.height in portrait however the device is held
				landscapeNatural = false;
			} else {
				landscapeNatural = screen.width !== screen.height && (angle % 180 === 0) === (screen.width > screen.height);
			}
			angle = (angle % 360 + 360) % 360;
			return {
				type: (landscapeNatural ?
					['landscape-primary', 'portrait-primary', 'landscape-secondary', 'portrait-secondary'] :
					['portrait-primary', 'landscape-primary', 'portrait-secondary', 'landscape-secondary'])[angle / 90],
				angle: angle
			};
		}

		// Impossible to tell whether the device is upside down, so consider both portrait orientations to be primary, likewise landscape
		return { type: (screen.width > screen.height) ? 'landscape-primary' : 'portrait-primary', angle: 0 };
	}

	function update() {
		var next = current();
		var event;

		if (next.type === last.type && next.angle === last.angle) return;
		last = next;

		try {
			event = new Event('change');
		} catch (e) {
			event = document.createEvent('Event');
			event.initEvent('change', false, false);
		}

		target.dispatchEvent(event);
	}

	// Find a native impl if it exists
	if ('orientation' in screen) propName = 'orientation';
	else if ('mozOrientation' in screen) propName = 'mozOrientation';
	else if ('msOrientation' in screen) propName = 'msOrientation';

	nativeGetter = ('getOwnPropertyDescriptor' in Object && Object.getOwnPropertyDescriptor(window.screen, propName)) ||
					('__lookupGetter__' in window.screen && window.screen.__lookupGetter__(propName));

	// For completeness, but no browser above our baseline lacks the screen property
	if (!('screen' in window)) window.screen = {};

	// If the value is not an object, the feature either doesn't exist or is incorrectly implemented
	if (typeof window.screen.orientation !== 'object') {

		last = current();
		createOrientation();

		try {
			Object.defineProperty(window.screen, 'orientation', {
				get: function () {
					return orientation;
				}
			});
		} catch(e1) {

			// screen is read-only in some browsers
			try {
				window.screen.orientation = orientation;
			} catch (e2) {}
		}

		// The screen size can settle after orientationchange, so resize rechecks it
		if ('onorientationchange' in window) window.addEventListener('orientationchange', update);
		window.addEventListener('resize', update);
	}
}());

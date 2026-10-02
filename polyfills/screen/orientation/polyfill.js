(function() {

	var propName, nativeGetter, last;
	var err = ' not supported in the screen.orientation polyfill';
	var listeners = [];
	var orientation = {
		onchange: null,
		addEventListener: function (type, listener) {
			if (type === 'change' && listener && indexOf(listener) === -1) listeners.push(listener);
		},
		removeEventListener: function (type, listener) {
			var index = indexOf(listener);
			if (type === 'change' && index !== -1) listeners.splice(index, 1);
		},
		lock: function(){
			throw new Error('lock method'+err);
		},
		unlock: function(){
			throw new Error('unlock method'+err);
		}
	};

	function indexOf(listener) {
		for (var i = 0; i < listeners.length; i++) {
			if (listeners[i] === listener) return i;
		}
		return -1;
	}

	function current() {
		var val, angle;

		if (nativeGetter) val = nativeGetter.call(window.screen);

		if (typeof val === 'string') {
			return { type: val, angle: (val.indexOf('secondary') !== -1) ? 180 : 0 };
		}

		// window.orientation is the rotation from the device's natural orientation, taken to be portrait
		if (typeof window.orientation === 'number') {
			angle = (window.orientation % 360 + 360) % 360;
			return {
				type: ['portrait-primary', 'landscape-primary', 'portrait-secondary', 'landscape-secondary'][angle / 90],
				angle: angle
			};
		}

		// Impossible to tell whether the device is upside down, so consider both portrait orientations to be primary, likewise landscape
		return { type: (screen.width > screen.height) ? 'landscape-primary' : 'portrait-primary', angle: 0 };
	}

	function invoke(listener, event) {
		try {
			if (typeof listener === 'function') listener.call(orientation, event);
			else if (listener && typeof listener.handleEvent === 'function') listener.handleEvent(event);
		} catch (e) {
			setTimeout(function () {
				throw e;
			}, 0);
		}
	}

	function update() {
		var next = current();
		var event, handlers, i;

		if (next.type === last.type && next.angle === last.angle) return;
		last = next;

		try {
			event = new Event('change');
		} catch (e) {
			event = document.createEvent('Event');
			event.initEvent('change', false, false);
		}

		handlers = listeners.slice();
		invoke(orientation.onchange, event);
		for (i = 0; i < handlers.length; i++) invoke(handlers[i], event);
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

		window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', update);
	}
}());

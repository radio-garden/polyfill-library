/* global Promise */
(function () {
	var run;
	if (typeof document !== 'undefined' && typeof document.createEvent === 'function') {
		var target = document.createElement('span');
		// The browser reports an exception thrown by a listener as uncaught, and dispatchEvent still returns.
		target.addEventListener('microtask', function (event) {
			var microtask = event.microtask;
			microtask();
		}, false);
		run = function (microtask) {
			var event = document.createEvent('Event');
			event.initEvent('microtask', false, false);
			event.microtask = microtask;
			target.dispatchEvent(event);
		};
	} else {
		run = function (microtask) {
			try {
				microtask();
			} catch (e) {
				setTimeout(function () {
					throw e;
				}, 0);
			}
		};
	}

	self.queueMicrotask = function queueMicrotask(microtask) {
		if (arguments.length < 1) {
			throw new TypeError(
				"queueMicrotask requires at least 1 argument, but only 0 were passed"
			);
		}

		if (typeof microtask != "function") {
			throw new TypeError("Argument 1 of queueMicrotask is not callable.");
		}

		Promise.resolve().then(function () {
			run(microtask);
		});
	};
})();

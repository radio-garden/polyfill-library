/* global Promise */
self.queueMicrotask = function queueMicrotask(microtask) {
	if (arguments.length < 1) {
		throw new TypeError(
			"queueMicrotask requires at least 1 argument, but only 0 were passed"
		);
	}

	if (typeof microtask != "function") {
		throw new TypeError("Argument 1 of queueMicrotask is not callable.");
	}

	Promise.resolve()
		.then(microtask).catch(function(e) {
			var thrown = Object(e);
			var init = {
				message: e instanceof Error ? e.message : String(e),
				filename: thrown.filename || thrown.fileName,
				lineno: thrown.lineno || thrown.lineNumber,
				colno: thrown.colno || thrown.columnNumber,
				error: e,
				cancelable: true
			};
			var event;
			// self.onerror receives the message and the exception only from an ErrorEvent.
			try {
				event = new ErrorEvent('error', init);
			} catch (_) {
				event = new Event('error', { cancelable: true });
				for (var key in init) {
					event[key] = init[key];
				}
			}
			self.dispatchEvent(event);
		});
};

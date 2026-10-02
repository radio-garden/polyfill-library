// Minimal test to ensure that fetch is included in CI
// TODO : real tests
it('exists', function () {
	proclaim.ok('fetch' in self);
});

if ('URLSearchParams' in self) {
	it('works with URLSearchParams as Request body', function (done) {
		// https://github.com/Financial-Times/polyfill-library/issues/870
		var request = new Request('#', { body: new URLSearchParams({ foo: 'baz' }), method: 'POST' });
		if (!('text' in request)) {
			proclaim.fail('expected "text" function in Request');
			return;
		}

		var text = request.text();
		if (!('then' in text)) {
			proclaim.fail('expected "then" function in text body');
			return;
		}

		text.then(function (x) {
			try {
				proclaim.equal(x, 'foo=baz');
				done();
			} catch (e) {
				done(e);
			}
		});
	});
}

if ('AbortController' in self) {
	it('sets signal on Request instantiation', function () {
		var ctrl = new AbortController();
		ctrl.abort();
		var req = new Request('#', { signal: ctrl.signal });
		proclaim.ok(req.signal);
		proclaim.ok(req.signal.aborted);
	});
}

// Runs where a native fetch without abort support was replaced by a stub before the polyfill loaded:
// `self.__nativeFetchStub` holds that stub's fetch (which records its calls), Request, Response and Headers.
if (self.__nativeFetchStub && 'AbortController' in self) {
	describe('on top of a native fetch without abort support', function () {
		var stub = self.__nativeFetchStub;

		function lastCall() {
			return stub.fetch.calls[stub.fetch.calls.length - 1];
		}

		function expectAbortError(promise, signal) {
			return promise.then(function () {
				throw new Error('expected the fetch to reject');
			}, function (error) {
				if (signal && signal.reason !== undefined) {
					proclaim.strictEqual(error, signal.reason);
				}
				proclaim.equal(error.name, 'AbortError');
			});
		}

		it('keeps native Request.prototype, Response and Headers', function () {
			proclaim.notStrictEqual(self.fetch, stub.fetch);
			proclaim.strictEqual(Request.prototype, stub.Request.prototype);
			proclaim.strictEqual(Response, stub.Response);
			proclaim.strictEqual(Headers, stub.Headers);
		});

		it('has the shape of fetch and Request', function () {
			proclaim.equal(fetch.name, 'fetch');
			proclaim.equal(fetch.length, 1);
			proclaim.equal(Request.name, 'Request');
			proclaim.equal(Request.length, 1);
			proclaim.strictEqual(new Request('/').constructor, Request);
		});

		it('passes the detect once loaded', function () {
			proclaim.ok('signal' in new Request(''));
		});

		it('calls native fetch and resolves with its response unchanged', function () {
			var response = new stub.Response();
			var init = { method: 'POST', body: 'x' };
			var promise = fetch('/a', init);
			var call = lastCall();
			proclaim.equal(call.input, '/a');
			proclaim.strictEqual(call.init, init);
			proclaim.strictEqual(call.self, self);
			call.resolve(response);
			return promise.then(function (result) {
				proclaim.strictEqual(result, response);
			});
		});

		it('passes a cache: no-store URL to native fetch unchanged', function () {
			fetch('/a?b=c', { cache: 'no-store' });
			proclaim.equal(lastCall().input, '/a?b=c');
			var request = new Request('/a?b=c', { cache: 'no-store' });
			proclaim.equal(request.url, '/a?b=c');
		});

		it('rejects with an AbortError without calling native fetch when already aborted', function () {
			var controller = new AbortController();
			controller.abort();
			var calls = stub.fetch.calls.length;
			var promise = fetch('/a', { signal: controller.signal });
			proclaim.equal(stub.fetch.calls.length, calls);
			return expectAbortError(promise, controller.signal);
		});

		it('rejects with an AbortError when aborted while in flight', function () {
			var controller = new AbortController();
			var promise = fetch('/a', { signal: controller.signal });
			var call = lastCall();
			controller.abort();
			call.resolve(new stub.Response());
			return expectAbortError(promise, controller.signal);
		});

		it('cancels the body of a response that arrives after the abort', function () {
			var controller = new AbortController();
			var promise = fetch('/a', { signal: controller.signal });
			var call = lastCall();
			controller.abort();
			var cancelled = false;
			var response = new stub.Response();
			response.body = { locked: false, cancel: function () { cancelled = true; } };
			call.resolve(response);
			return expectAbortError(promise).then(function () {
				return call.promise;
			}).then(function () {
				proclaim.isTrue(cancelled);
			});
		});

		it('resolves with the native response when it completes before the abort, and stops listening', function () {
			var listeners = 0;
			var signal = {
				aborted: false,
				addEventListener: function () { listeners++; },
				removeEventListener: function () { listeners--; }
			};
			var response = new stub.Response();
			var promise = fetch('/a', { signal: signal });
			proclaim.equal(listeners, 1);
			lastCall().resolve(response);
			return promise.then(function (result) {
				proclaim.strictEqual(result, response);
				proclaim.equal(listeners, 0);
			});
		});

		it('rejects with the native error when native fetch fails before the abort', function () {
			var controller = new AbortController();
			var error = new TypeError('Failed to fetch');
			var promise = fetch('/a', { signal: controller.signal });
			lastCall().reject(error);
			return promise.then(function () {
				throw new Error('expected the fetch to reject');
			}, function (result) {
				proclaim.strictEqual(result, error);
			});
		});

		it('keeps the signal on a Request, its clones and copies', function () {
			var controller = new AbortController();
			var request = new Request('/a', { signal: controller.signal });
			proclaim.strictEqual(request.signal, controller.signal);
			proclaim.isInstanceOf(request, Request);
			proclaim.isInstanceOf(request, stub.Request);
			proclaim.strictEqual(request.clone().signal, controller.signal);
			proclaim.strictEqual(new Request(request).signal, controller.signal);
			var other = new AbortController();
			proclaim.strictEqual(new Request(request, { signal: other.signal }).signal, other.signal);
		});

		it('honours the signal of a Request passed to fetch', function () {
			var controller = new AbortController();
			var request = new Request('/a', { signal: controller.signal });
			var promise = fetch(request);
			proclaim.strictEqual(lastCall().input, request);
			controller.abort();
			return expectAbortError(promise, controller.signal);
		});

		it('prefers the init signal over the signal of a Request', function () {
			var requestController = new AbortController();
			var initController = new AbortController();
			var request = new Request('/a', { signal: requestController.signal });
			var promise = fetch(request, { signal: initController.signal });
			requestController.abort();
			initController.abort();
			return expectAbortError(promise, initController.signal);
		});
	});
}

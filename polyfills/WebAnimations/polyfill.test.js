it('is defined as a function on Element.prototype', function () {
	proclaim.isTypeOf(document.createElement('div').animate, 'function');
});

describe('requestAnimationFrame', function () {
	it('runs every callback of a frame when an earlier one throws, and reports the error', function (done) {
		var error = new Error('thrown from a frame callback');
		var calls = [];
		var reported = [];
		var onerror = window.onerror;
		window.onerror = function (message, source, line, column, thrown) {
			reported.push(thrown);
			return true;
		};

		requestAnimationFrame(function () {
			calls.push(1);
			setTimeout(function () {
				window.onerror = onerror;
				try {
					proclaim.deepStrictEqual(calls, [1, 2, 3]);
					proclaim.deepStrictEqual(reported, [error]);
					done();
				} catch (assertion) {
					done(assertion);
				}
			}, 50);
		});
		requestAnimationFrame(function () {
			calls.push(2);
			throw error;
		});
		requestAnimationFrame(function () {
			calls.push(3);
		});
	});

	it('keeps running later frames after a callback throws', function (done) {
		var onerror = window.onerror;
		window.onerror = function () {
			return true;
		};

		requestAnimationFrame(function () {
			throw new Error('thrown from a frame callback');
		});
		requestAnimationFrame(function () {
			requestAnimationFrame(function () {
				window.onerror = onerror;
				done();
			});
		});
	});
});

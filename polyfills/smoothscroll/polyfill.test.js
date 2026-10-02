describe('scroll', function () {
	it('is defined as a function on window', function () {
		proclaim.isTypeOf(window.scroll, 'function');
	});

	it('is defined as a function on Element.prototype', function () {
		// The polyfill only patches HTMLElement if available.
		var Element = window.HTMLElement || window.Element;
		proclaim.isTypeOf(Element.prototype.scroll, 'function');
	});
});

describe('scrollBy', function () {
	it('is defined as a function on window', function () {
		proclaim.isTypeOf(window.scrollBy, 'function');
	});

	it('is defined as a function on Element.prototype', function () {
		var Element = window.HTMLElement || window.Element;
		proclaim.isTypeOf(Element.prototype.scrollBy, 'function');
	});
});

describe('scrollTo', function () {
	it('is defined as a function on window', function () {
		proclaim.isTypeOf(window.scrollTo, 'function');
	});

	it('is defined as a function on Element.prototype', function () {
		var Element = window.HTMLElement || window.Element;
		proclaim.isTypeOf(Element.prototype.scrollTo, 'function');
	});
});

describe('scrollIntoView', function () {
	it('is defined as a function on Element.prototype', function () {
		var Element = window.HTMLElement || window.Element;
		proclaim.isTypeOf(Element.prototype.scrollIntoView, 'function');
	});
});

describe('scrolling', function () {
	var box;
	var spacer;

	beforeEach(function () {
		box = document.createElement('div');
		box.style.cssText = 'width:100px;height:100px;overflow:scroll;';
		var content = document.createElement('div');
		content.style.cssText = 'width:2000px;height:2000px;';
		box.appendChild(content);
		document.body.appendChild(box);
		box.scrollLeft = 50;
		box.scrollTop = 30;
	});

	afterEach(function () {
		document.body.removeChild(box);
		if (spacer) {
			window.scrollTo(0, 0);
			document.body.removeChild(spacer);
			spacer = undefined;
		}
	});

	it('Element.prototype.scrollTo({ top }) keeps the horizontal position', function () {
		box.scrollTo({ top: 100 });
		proclaim.strictEqual(box.scrollLeft, 50);
		proclaim.strictEqual(box.scrollTop, 100);
	});

	it('Element.prototype.scrollTo({ left }) keeps the vertical position', function () {
		box.scrollTo({ left: 10 });
		proclaim.strictEqual(box.scrollLeft, 10);
		proclaim.strictEqual(box.scrollTop, 30);
	});

	it('Element.prototype.scrollTo({}) keeps both positions', function () {
		box.scrollTo({});
		proclaim.strictEqual(box.scrollLeft, 50);
		proclaim.strictEqual(box.scrollTop, 30);
	});

	it('window.scrollTo({ top }) keeps the horizontal position', function () {
		spacer = document.createElement('div');
		spacer.style.cssText = 'width:5000px;height:5000px;';
		document.body.appendChild(spacer);
		window.scrollTo(40, 0);
		window.scrollTo({ top: 200 });
		proclaim.strictEqual(window.pageXOffset, 40);
		proclaim.strictEqual(window.pageYOffset, 200);
	});

	it('an instant scrollTo(x, y) stops a running smooth scroll', function (done) {
		box.scrollTo({ top: 1000, behavior: 'smooth' });
		setTimeout(function () {
			box.scrollTo(0, 0);
			setTimeout(function () {
				try {
					proclaim.strictEqual(box.scrollTop, 0);
					done();
				} catch (error) {
					done(error);
				}
			}, 700);
		}, 50);
	});

	it('an instant scrollTo({ top }) stops a running smooth scroll', function (done) {
		box.scrollTo({ top: 1000, behavior: 'smooth' });
		setTimeout(function () {
			box.scrollTo({ top: 0 });
			setTimeout(function () {
				try {
					proclaim.strictEqual(box.scrollTop, 0);
					done();
				} catch (error) {
					done(error);
				}
			}, 700);
		}, 50);
	});

	it('Element.prototype.scrollTo({ top: null }) scrolls to 0', function () {
		box.scrollTo({ top: null });
		proclaim.strictEqual(box.scrollLeft, 50);
		proclaim.strictEqual(box.scrollTop, 0);
	});

	it('Element.prototype.scroll({ left: null }) scrolls to 0', function () {
		box.scroll({ left: null });
		proclaim.strictEqual(box.scrollLeft, 0);
		proclaim.strictEqual(box.scrollTop, 30);
	});

	it('window.scrollTo({ top: null }) scrolls to 0', function () {
		spacer = document.createElement('div');
		spacer.style.cssText = 'width:5000px;height:5000px;';
		document.body.appendChild(spacer);
		window.scrollTo(40, 100);
		window.scrollTo({ top: null });
		proclaim.strictEqual(window.pageXOffset, 40);
		proclaim.strictEqual(window.pageYOffset, 0);
	});

	function expectSmoothScrollStopped(done, start, interrupt, position) {
		start();
		setTimeout(function () {
			interrupt();
			var stoppedAt = position();
			setTimeout(function () {
				try {
					proclaim.strictEqual(position(), stoppedAt);
					done();
				} catch (error) {
					done(error);
				}
			}, 700);
		}, 50);
	}

	it('scrollIntoView() stops a running smooth scroll of its scroll container', function (done) {
		expectSmoothScrollStopped(done, function () {
			box.scrollTo({ top: 1000, behavior: 'smooth' });
		}, function () {
			box.firstChild.scrollIntoView();
		}, function () {
			return box.scrollTop;
		});
	});

	it('scrollIntoView(false) stops a running smooth scroll of its scroll container', function (done) {
		expectSmoothScrollStopped(done, function () {
			box.scrollTo({ top: 1000, behavior: 'smooth' });
		}, function () {
			box.firstChild.scrollIntoView(false);
		}, function () {
			return box.scrollTop;
		});
	});

	it('a scroll of the scrolling element stops a smooth scroll of the window', function (done) {
		var scrollingElement = document.scrollingElement || document.documentElement;
		spacer = document.createElement('div');
		spacer.style.cssText = 'width:5000px;height:5000px;';
		document.body.appendChild(spacer);
		expectSmoothScrollStopped(done, function () {
			window.scrollTo({ top: 1000, behavior: 'smooth' });
		}, function () {
			scrollingElement.scrollTo(0, 0);
		}, function () {
			return window.pageYOffset;
		});
	});

	it('a scroll of the window stops a smooth scroll of the scrolling element', function (done) {
		var scrollingElement = document.scrollingElement || document.documentElement;
		spacer = document.createElement('div');
		spacer.style.cssText = 'width:5000px;height:5000px;';
		document.body.appendChild(spacer);
		expectSmoothScrollStopped(done, function () {
			scrollingElement.scrollTo({ top: 1000, behavior: 'smooth' });
		}, function () {
			window.scrollTo(0, 0);
		}, function () {
			return window.pageYOffset;
		});
	});
});

'use strict';

var fs = require('fs');
var process = require('process');
var path = require('path');

var polyfillPath = path.join(__dirname, './polyfill.js');
var polyfill = fs.readFileSync(polyfillPath, 'utf8');

// Run each queued requestAnimationFrame callback from a listener of a private event target,
// so that an exception is reported as uncaught right away and the next callback still runs.
var search = 'b.forEach(function(b){b[1](a)})';
var replacement = 'b.forEach(function(b){var c=d.t;c||(c=d.t=document.createElement("div"),c.addEventListener("frame",function(){c.f(c.a)},!1));c.f=b[1],c.a=a;var e=document.createEvent("Event");e.initEvent("frame",!1,!1),c.dispatchEvent(e),c.f=c.a=null})';

if (polyfill.split(search).length !== 2) {process.exit(1);}
fs.writeFileSync(polyfillPath, polyfill.replace(search, function () { return replacement; }));

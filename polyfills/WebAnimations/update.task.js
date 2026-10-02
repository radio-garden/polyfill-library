'use strict';

var fs = require('fs');
var process = require('process');
var path = require('path');

var polyfillPath = path.join(__dirname, './polyfill.js');
var polyfill = fs.readFileSync(polyfillPath, 'utf8');

// Run each queued requestAnimationFrame callback even when an earlier one throws,
// and report the exception from a task of its own the way browsers do.
var search = 'b.forEach(function(b){b[1](a)})';
var replacement = 'b.forEach(function(b){try{b[1](a)}catch(c){setTimeout(function(){throw c},0)}})';

if (polyfill.split(search).length !== 2) {process.exit(1);}
fs.writeFileSync(polyfillPath, polyfill.replace(search, function () { return replacement; }));

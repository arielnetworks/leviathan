
var FS = require("q-io/fs");
var Q = require('q');
Q.longStackSupport = true;
var Path = require('path');
var app = require('./app');

var argv = require('minimist')(process.argv.slice(2));

FS.read(argv.f)
.then(JSON.parse)
.catch(function(error) { throw new Error('-f leviathan.sample.json') })
.then(app.launch)
.catch(function(error) { console.log(error.stack) });


/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var _ = require('underscore');

// Setup configuration
var PORT = process.env.PORT || 3000;
global.configure = {
  // Example: "mongodb://localhost/leviathan"
  // If null, nedb (disk persistence). will be used.
  MONGODB: process.env.MONGODB || null
};



// Express environments
var app = express();
app.set('port', PORT);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Routing
_.each([
  'revisions',
  'tidal-wave'
], function(name) {
  _.each(require('./routes/' + name), function(actions, method) {
    _.each(actions, function(handler, action) {
      app[method]('/' + name + (action == 'index' ? '' : '/' + action), handler);
    });
  });
});

// After connecting DB, launch HTTP server.
require('./persist').ready.then(function() {
  http.createServer(app).listen(app.get('port'), function() {
    console.log('Leviathan server listening on port ' + app.get('port'));
  });
})
.catch(function() {
  console.log('boom');
})

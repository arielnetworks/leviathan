
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var _ = require('underscore');
var Q = require('q');



module.exports.launch = launch;



/**
 * @return {Q.Promise<
 *    app: {}
 *    server: tls.Server
 *  >}
 */
function launch(configure) {

  global.configure = configure;

  console.log(global.configure);
    
  // Express environments
  var app = express();
  app.set('port', global.configure.PORT);
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
  var server;
  return require('./persist').ready
  .then(function() {
    server = http.createServer(app);
    return Q.ninvoke(server, 'listen', app.get('port'));
  })
  .then(function() {
    console.log('Leviathan server listening on port ' + app.get('port'));
    return {
      app: app,
      server: server
    };
  })
  .catch (function(reason) {
    console.log('Launching application fails.');
    console.log(reason);
    process.exit(1);
  });

}


/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var _ = require('underscore');
var Q = require('q');
Q.longStackSupport = true;
var assert = require('assert');



module.exports.launch = launch;



/**
 * @param { {
 *  } } configure
 * @return {Q.Promise<
 *    app: {}
 *    server: tls.Server
 *  >}
 */
function launch(configure) {

  // Define global configuration
  global.configure = {};
  Object.defineProperties(global.configure, {
    baseImageDir: { value: configure.baseImageDir },
    relativeExpectedDir: { value: configure.relativeExpectedDir },
    relativeTargetDirPrefix: { value: configure.relativeTargetDirPrefix || '' },
    port: { value: process.env.PORT || 3000 },
    publicCaptureDir: { value: configure.publicCaptureDir || '/captures' },
    db: { value: configure.db || { type: 'memory' } }
  });
  Object.seal(global.configure);

  // Required configurations:
  assert(global.configure.baseImageDir);
  assert(global.configure.relativeExpectedDir);

  // Express environments
  var app = express();
  app.set('port', global.configure.port);
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);

  // Expose captures
  app.use(global.configure.publicCaptureDir || '/captures', express.static(global.configure.baseImageDir));

  app.use(express.static(path.join(__dirname, 'public')));
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  // API Routing
  _.each([
    'revisions',
    'tidal-wave'
  ], function(name) {
    _.each(require('./api/' + name), function(actions, method) {
      _.each(actions, function(handler, action) {
        app[method]('/api/' + name + (action == 'index' ? '' : '/' + action), handler);
      });
    });
  });

  var server = http.createServer(app);

  var promiseLaunch = require('./persist').ready()
  .then(Q.nbind(server.listen, server, app.get('port')))
  .then(function() {
    console.log('Leviathan server listening on port ' + app.get('port'));
  })
  .catch (function(error) {
    console.log('Launching application fails.');
    console.log(error.stack);
    process.exit(1);
  });

  return {
    app: app,
    server: server,
    promiseLaunch: promiseLaunch
  };

  // // After connecting DB, launch HTTP server.
  // var server;
  // return require('./persist').ready()
  // .then(function() {
  //   server = http.createServer(app);
  //   return Q.ninvoke(server, 'listen', app.get('port'));
  // })
  // .then(function() {
  //   console.log('Leviathan server listening on port ' + app.get('port'));
  //   return {
  //     app: app,
  //     server: server
  //   };
  // })
  // .catch (function(error) {
  //   console.log('Launching application fails.');
  //   console.log(error.stack);
  //   process.exit(1);
  // });

}

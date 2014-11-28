
/**
 * Module dependencies.
 */

var express = require('express');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
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
    relativeTargetDirPrefix: { value: configure.relativeTargetDirPrefix || '' },
    port: { value: process.env.PORT || 3000 },
    publicCaptureDir: { value: configure.publicCaptureDir || '/captures' },
    db: { value: configure.db || { type: 'memory' } }
  });
  Object.seal(global.configure);

  // Required configurations:
  assert(global.configure.baseImageDir);

  // Express environments
  var app = express();
  app.set('port', global.configure.port);
  app.set('views', path.join(__dirname, 'views'));

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Expose captures
  app.use(global.configure.publicCaptureDir || '/captures', express.static(global.configure.baseImageDir));

  app.use(express.static(path.join(__dirname, 'public')));
  if ('development' == app.get('env')) {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
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

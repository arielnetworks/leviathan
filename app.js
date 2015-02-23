
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
var compress = require('compression');




module.exports.launch = launch;



/**
 * @param { {
 *  } } configure
 * @return {Q.Promise<{
 *    app: {}
 *    server: tls.Server
 *  }>}
 */
function launch(configure) {

  // Define global configuration
  global.configure = {};
  Object.defineProperties(global.configure, {
    baseImageDir: { value: configure.baseImageDir },
    relativeTargetDirPrefix: { value: configure.relativeTargetDirPrefix || '' },
    port: { value: configure.port || 3000 },
    publicCaptureDir: { value: configure.publicCaptureDir || '/captures' },
    mongodb: { value: configure.mongodb || 'mongodb://127.0.0.1:27017/leviathan_sample' }
  });
  Object.seal(global.configure);

  // Required configurations:
  assert(global.configure.baseImageDir);

  // Express environments
  var app = express();
  app.set('port', global.configure.port);
  app.set('views', path.join(__dirname, 'src/jade'));
  app.set('view engine', 'jade');

  app.use(logger('dev'));
  app.use(compress());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Expose captures
  app.use(global.configure.publicCaptureDir, express.static(global.configure.baseImageDir));
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', function(req, res) { res.render('index') });
  app.get('/revisions/:revision', function(req, res) {
    res.render('revision', {revision: req.params.revision});
  });
  app.get('/revisions/:revision/captures/:capture', function(req, res) {
    res.render('revisioncapture', {revision: req.params.revision, capture: req.params.capture });
  });

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
    'captures',
    'tidal-wave'
  ], function(name) {
    _.each(require('./src/api/' + name), function(actions, method) {
      _.each(actions, function(handler, action) {
        app[method]('/api/' + name + (action == 'index' ? '' : '/' + action), handler);
      });
    });
  });

  var server = http.createServer(app);

  var promiseLaunch = Q.ninvoke(server, 'listen', app.get('port'))
  .then(function() {
    console.log('Leviathan server listening on port ' + app.get('port'));
  })
  .then(function() {
    return {
      app: app,
      server: server
    };
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
}

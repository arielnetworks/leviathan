/**
 * Module dependencies.
 */

var express = require('express');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var Path = require('path');
var _ = require('underscore');
var Q = require('q');
Q.longStackSupport = true;
var assert = require('assert');
var compress = require('compression');

var React = require('react');
var Router = require('react-router');
require('node-jsx').install({ harmony: true });




module.exports.launch = launch;



/**
 * @param { {
 *  } } configure
 * @return {Q.Promise<{
 *    app: {}
 *    server: tls.Server
 *  }>}
 */
function launch(config) {

  // Define global configuration
  global.configure = {};
  Object.defineProperties(global.configure, {
    baseImageDir: { value: config.baseImageDir },
    relativeTargetDirPrefix: { value: config.relativeTargetDirPrefix || '' },
    port: { value: config.port || 3000 },
    publicCaptureDir: { value: config.publicCaptureDir || '/captures' },
    mongodb: { value: config.mongodb || 'mongodb://127.0.0.1:27017/leviathan_sample' }
  });
  Object.seal(global.configure);

  // Required configurations:
  assert(global.configure.baseImageDir);
  assert(config.sessionSecret);

  // Express environments
  var app = express();
  app.set('port', global.configure.port);
  app.set('views', Path.join(__dirname, 'src/jade'));
  app.set('view engine', 'jade');

  app.use(logger('dev'));
  app.use(compress());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({
    secret: config.sessionSecret,
    cookie: { maxAge: 30 * 1000 },
    saveUninitialized: true,
    resave: true
  }));
  app.use(cookieParser());

  // Expose captures
  app.use(global.configure.publicCaptureDir, express.static(global.configure.baseImageDir));
  app.use(express.static(Path.join(__dirname, 'public')));



  // Browser Access Routes
  var RevisionsApi = require('./src/api/revisions');
  var UiRoutes = require('./src/ui/routes');
  var RevisionStore = require('./src/ui/stores/RevisionStore');

  app.get('/', function(req, res) {
    var store = RevisionStore.create();
    RevisionsApi.get[''](req)
    .then(store.storeRevisions.bind(store))
    .catch(asError)
    .done(bindDataOnHTML(req, res, store));
  });

  app.get('/revisions/:id', function(req, res) {
    var store = RevisionStore.create();
    RevisionsApi.get[':id/captures'](req)
    .then(store.storeCaptures.bind(store))
    .catch(asError)
    .done(bindDataOnHTML(req, res, store));
  });

  app.get('/revisions/:id/captures/:capture', function(req, res) {
    var store = RevisionStore.create();
    Q.all([
      RevisionsApi.get[':id/captures'](req)
      .then(store.storeCaptures.bind(store)),
      RevisionsApi.get[':id/captures/:capture'](req)
      .then(store.storeCapture.bind(store))
    ])
    .catch(asError)
    .done(bindDataOnHTML(req, res, store));
  });

  function bindDataOnHTML(req, res, store) {
    return function() {
      Router.run(UiRoutes, req.path, function(Handler) {
        var markup = React.renderToString(React.createElement(Handler, { store: store }));
        res.render('index', {
          markup: markup,
          initialData: JSON.stringify(store.getStore())
        });
      });
      store.clearStore();
    };
  }



  // API Routing
  _.each([
    'revisions',
    'captures',
    'tidal-wave'
  ], function(name) {
    _.each(require('./src/api/' + name), function(actions, method) {
      _.each(actions, function(buildData, action) {
        app[method](Path.join('/api/', name, action), function(req, res) {
          buildData(req)
          .catch(asError)
          .done(res.json.bind(res));
        });
      });
    });
  });

  function asError(reason) {
    console.error(reason);
    return { error: true, reason: reason };
  }



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
  .catch(function(error) {
    console.log('Launching application fails.');
    console.log(error.stack);
    throw new Error(error);
  });

  return {
    app: app,
    server: server,
    promiseLaunch: promiseLaunch
  };
}

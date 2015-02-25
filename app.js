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
var ApiUtil = require('./src/api/util');

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

  var RevisionsApi = require('./src/api/revisions');
  var routes = require('./src/ui/routes');
  // TODO: Separate store for each request.
  var RevisionStore = require('./src/ui/stores/RevisionStore');

  app.get('/', function(req, res, next) {
    var store = RevisionStore.create();
    RevisionsApi.get[''](req)
    .then(function(data) {
      store.storeRevisions(data);
    })
    .done(bindDataOnResponse(req, res, store))
  });

  app.get('/revisions/:id', function(req, res, next) {
    var store = RevisionStore.create();
    RevisionsApi.get[':id'](req)
    .then(function(data) {
      store.storeCaptures(data);
    })
    .done(bindDataOnResponse(req, res, store))
  });

  app.get('/revisions/:revision/captures/:capture', function(req, res, next) {
    RevisionStore.storeCaptures(req['@resolvedValue']);
    next();
  }, handleBrowserRequest);


  function bindDataOnResponse(req, res, store) {
    return function() {
      Router.run(routes, req.path, function(Handler) {
        var markup = React.renderToString(React.createElement(Handler, { store: store }));
        res.render('index', {
          markup: markup,
          initialData: JSON.stringify(store.getStore())
        });
      });
      store.clearStore();
    }
  }



  function handleBrowserRequest(req, res) {
    Router.run(routes, req.path, function(Handler) {
      var markup = React.renderToString(React.createElement(Handler));
      res.render('index', {
        markup: markup
        // , initialData: JSON.stringify(RevisionStore.getStore())
      });
    });
    RevisionStore.clearStore();
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
          .catch(function(reason) {
            return res.json({ error: true, reason: reason });
          })
          .done(function(data) {
            res.json(data);
          })
        });
      });
    });
  });

  if (app.get('env') === 'development') {
    /*eslint-disable no-unused-vars*/
    app.use(function(err, req, res, next) {
      // console.log(err.stack);
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
    /*eslint-enable no-unused-vars*/
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

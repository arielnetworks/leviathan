
var path = require('path');
var _ = require('underscore');
var request = require('supertest');
var assert = require('assert');

describe('Application', function() {

  var server;
  afterEach(function() {
    if (server) {
      server.close();
      server = null;
    }
  });

  _.each(['memory'], function(dbType) {

    describe('should work in ' + dbType + ' storage', function() {

      it('should launch good in ' + dbType, function(done) {
        launchApplication(dbType).then(function(v) {
          server = v.server;
          request(v.app)
          .get('/revisions')
          .expect(200, done);
        })
      });

      it('should store tidal-wave result' + dbType, function(done) {
        launchApplication(dbType).then(function(v) {
          server = v.server;
          request(v.app)
          .post('/tidal-wave/2')
          .expect(200)
          .expect({ total: 2, reported: 1 }, done);
        })
      });

    });

  })

});

function launchApplication(dbType) {
  var application = require('../app');
  var configure;
  switch(dbType) {
    case 'memory':
      configure = {
        port: 3000,
        db: {}
      };
      break;
  }
  if (!configure) throw new Error('booom');
  return application.launch(configure);
}


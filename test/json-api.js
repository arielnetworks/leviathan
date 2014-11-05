
var path = require('path');
var _ = require('underscore');
var request = require('supertest');
var assert = require('assert');

process.env.NODE_ENV = 'test';

describe('Application', function() {

  _.each(['memory'], function(dbType) {

    describe('should work in ' + dbType + ' storage', function() {

      var server;
      after(function() {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        if (server) {
          server.close();
          server = null;
        }
      });
      var launched = launchApplication(dbType);
      launched.then(function(v) {
        server = v.server;
      });

      it('should launch good in ' + dbType, function(done) {
        launched.then(function(v) {
          request(v.app)
          .get('/revisions')
          .expect(200)
          .expect({ revisions: [] }, done);
        })
      });

      it('should store tidal-wave result' + dbType, function(done) {
        launched.then(function(v) {
          request(v.app)
          .post('/tidal-wave/2')
          .expect(200)
          // .expect(function(res) {
          //   console.log(res.body);
          // })
          .expect({ total: 2, reported: 1 }, done);
        })
      });

      it('/revisions should show good in' + dbType, function(done) {
        launched.then(function(v) {
          request(v.app)
          .get('/revisions')
          .expect(200)
          .expect({ 
            revisions: [
              { id: 2, updatedAt: '1970-01-01T00:00:00.000Z' },
            ]
          }, done);
        })
      });

      it('/revisions/2 should show good in' + dbType, function(done) {
        launched.then(function(v) {
          server = v.server;
          request(v.app)
          .get('/revisions/2')
          .expect(200)
          .expect(function(res) {
            console.log(res.body);
          })
          .expect({ 
            id: 2, updatedAt: '1970-01-01T00:00:00.000Z'
          }, done);
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

